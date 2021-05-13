## les technos
Salut, le code du backend est en typescript avec le framework adonis v5 https://adonisjs.com/

Pour le moment le rendu est coté serveur, avec le systeme de template du framework

Pour le style c'est juste du CSS pur

## les contributions
Toutes les contributions sont les bienvenues

Si vous voyez un bug, une erreur ou quoi, et que vous ne savez pas comment la fix, faites une nouvelle Issue

(https://github.com/mle-moni/peerclass/issues)

Si vous avez une idée pour ameliorer le site, faites aussi une nouvelle Issue

## privacy
si une peerclass a été publiée **sans l'accord** de celui qui a fait la peerclass, il suffit de me demander, et je supprimerai tout de suite

je supprimerai aussi, si celui qui a donné son accord **change d'avis**

niveau **data de l'API 42**, je n'utilise que votre login comme nom d'utilisateur, c'est tout

niveau **cookie**, je n'utilise que les cookies de session d'adonis (juste pour être connecté sur la page jusqu'à l'expiration du cookie)

niveau **logs**, j'enregistre certaines des actions des utilisateurs de manière anonyme sauf pour certaines actions critiques

voici ce qui est log (en gras les actions non anonyme) :
- lors d'une creation de compte : `<timestamp> Someone created an account`
- apres s'etre login : `<timestamp> Someone logged in`
- apres avoir posté une peerclass : `<timestamp> Someone posted a peerclass`
- apres avoir modifié une peerclass : `<timestamp> Someone updated a peerclass`
- **lors d'une 403** (acces interdit) : `<timestamp> <username> tried to access <url>`
- **lors de la suppression d'une peerclass** : `<timestamp> <username> deleted a peerclass, title = <peerclass.title>`
- **lorsqu'un admin valide une peerclass** : `<timestamp> <username> validated peerclass with id <peerclass.id>`

Vous pouvez verifier cela en cherchant dans ce dossier le mot clé : `Log.create`, vous allez tombez sur tous les logs :

exemple :
```ts
Log.create({
    type: 'error',
    msg: `${user.login} tried to access ${request.url(true)}`
})
```
