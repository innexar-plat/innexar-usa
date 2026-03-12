# 🔑 Como Obter a Senha de App - Passo a Passo

## 📸 Baseado na Tela que Você Está Vendo

### Opção 1: Usar a Senha Existente

Você já tem uma senha criada: **"app email innexar"**

1. Clique no **ícone de lixeira** ao lado dessa senha
2. Isso vai **mostrar a senha** ou permitir **regenerá-la**
3. Copie a senha de 16 caracteres
4. Use no `.env.local` **SEM espaços**

### Opção 2: Criar uma Nova Senha

1. No campo **"Nome do app"**, digite: `Innexar Site Email`
2. Clique no botão **"Criar"**
3. Uma senha de 16 caracteres será gerada
4. **COPIE IMEDIATAMENTE** (você não verá novamente)
5. Use no `.env.local` **SEM espaços**

---

## ⚠️ IMPORTANTE

A senha aparece como **4 grupos de 4 caracteres**, exemplo:
```
ttba tsxd qrhf mvdb
```

**No `.env.local`, use SEM espaços:**
```env
SMTP_PASSWORD=ttbatsxdqrhfmvdb
```

---

## 🔍 Se Não Aparecer a Senha

1. **Delete a senha antiga** (ícone de lixeira)
2. **Crie uma nova** no campo "Nome do app"
3. A senha será mostrada **uma única vez**
4. Copie imediatamente

---

## ✅ Depois de Obter a Senha

1. Atualize o `.env.local`:
   ```env
   SMTP_PASSWORD=senha_sem_espacos_aqui
   ```

2. Teste:
   ```bash
   cd site-innexar
   node test-email.js
   ```

---

## 🆘 Se Ainda Não Funcionar

Verifique se:
- ✅ Verificação em 2 etapas está **ATIVADA**
- ✅ Senha está **SEM espaços** no `.env.local`
- ✅ Email `comercial@innexar.app` é do **Google Workspace**

