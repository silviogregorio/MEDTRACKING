# 🔒 GUIA DE SEGURANÇA - MEDTRACKING

## Visão Geral de Segurança

Este documento descreve as medidas de segurança implementadas no MEDTRACKING para proteção de dados sensíveis e acesso de usuários.

## 1. Variáveis de Ambiente (.env)

### ⚠️ NUNCA commit arquivos .env

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Atualize com valores seguros
```

### Variáveis Obrigatórias:
- `JWT_SECRET` - Chave para assinar tokens JWT (min 32 caracteres)
- `REFRESH_TOKEN_SECRET` - Chave para refresh tokens (min 32 caracteres)
- `DB_PASSWORD` - Senha do banco de dados
- `BCRYPT_ROUNDS` - Número de rounds (recomendado: 10-12)

## 2. Autenticação JWT

### Token Flow:

1. **Login**: Email + Senha → Access Token (24h) + Refresh Token (7d)
2. **Requests**: Enviar `Authorization: Bearer <accessToken>`
3. **Refresh**: Usar refresh token para gerar novo access token
4. **Logout**: Invalidar tokens no servidor

### Estrutura do Token:

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 3. Níveis de Acesso (RBAC)

### Roles de Usuário:

| Role | Permissão | Uso |
|------|----------|-----|
| ADMIN | Total | Administradores do sistema |
| FARMACÊUTICO | Write/Delete | Gestão farmacêutica |
| OPERADOR | Write | Operação do sistema |
| VISUALIZADOR | Read | Consulta apenas |
| USUÁRIO | Read | Usuário básico |

### Níveis de Acesso:

```typescript
enum AccessLevel {
  NONE = 0,      // Sem acesso
  READ = 1,      // Apenas leitura
  WRITE = 2,     // Leitura + escrita
  DELETE = 3,    // + deleção
  ADMIN = 4      // Acesso total
}
```

## 4. Hashing de Senhas

### Implementação:

```typescript
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

// Hash de senha
const hashSenha = await bcrypt.hash(senha, BCRYPT_ROUNDS);

// Verificação
const valido = await bcrypt.compare(senhaEntrada, senhaArmazenada);
```

## 5. Proteção Contra Ataque de Força Bruta

### Mecanismo:

- Máximo de `5 tentativas` de login
- Bloqueio por `15 minutos` após exceder
- Registro de tentativas em banco de dados

### Implementação:

```typescript
if (usuario.tentativasLogin >= MAX_LOGIN_ATTEMPTS) {
  if (Date.now() < usuario.bloqueadoAte) {
    throw new UnauthorizedException('Usuário bloqueado temporariamente');
  } else {
    usuario.tentativasLogin = 0;
  }
}
```

## 6. CORS - Cross-Origin Resource Sharing

### Configuração Segura:

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 7. Middleware de Autenticação

### Uso:

```typescript
@Post('protected')
@UseGuards(AuthGuard('jwt'))
async protectedRoute(@Req() req: Request) {
  // req.user conterá dados do token
}
```

## 8. Sanitização de Dados

### Boas Práticas:

- Validar todos os inputs
- Usar sanitizadores (xss, express-validator)
- Evitar SQL injection com ORM
- Escapar saídas HTML

## 9. HTTPS/TLS

### Produção:

```bash
# Sempre usar HTTPS
# Redirect HTTP → HTTPS
# Certificado SSL válido
```

## 10. Logs e Monitoramento

### Eventos a Registrar:

- ✅ Login/Logout
- ✅ Mudanças de permissões
- ✅ Acesso a dados sensíveis
- ✅ Erros de autenticação
- ✅ Mudanças de configuração

### Exemplo:

```typescript
logger.info(`Login bem-sucedido: ${email}`, {
  timestamp: new Date(),
  userId: user.id,
  role: user.role
});
```

## 11. Checklist de Deploy

Antes de colocar em produção:

- [ ] Todas as secrets em variáveis de ambiente
- [ ] HTTPS/TLS ativado
- [ ] Backup automatizado do banco de dados
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Plano de recuperação de falhas
- [ ] Testes de penetração
- [ ] Compliance com LGPD/GDPR

## 12. Política de Senhas

### Requisitos:

- Mínimo 12 caracteres
- Letras maiusculas, minúsculas, números e símbolos
- Não reutilizar últimas 5 senhas
- Alteração a cada 90 dias
- Expirar após inatividade de 30 dias

## 13. Contato de Segurança

Para relatar vulnerabilidades:

📧 **security@medtracking.com**

---

**Versão**: 1.0  
**Última atualização**: 2025-11-15
