Transcendance.

Backend :
    - Pour faire la moindre installation, il faut passer dans le docker.
    - Pour acceder au docker -> docker exec -it django /bin/bash
    - Pour creer une app :
        - Aller dans le dossier sources du backend, et faire la commande "python manage.py startapp <nom_app>"
    - Pour installer un package :
        - "pip install <nom_package>"
        - Se mettre dans le dossier avec le requirements et faire "pip freeze > requirement.txt" pour remplir.

Frontend :
    - Pour faire la moindre installation, il faut passer dans le docker.
    - Pour acceder au docker -> docker exec -it react /bin/sh
    - On peut voir la liste des packages installer dans le package.json
    - Pour installer un package :
        - "npm i <nom_package>


GIT :
    - git checkout blablabla -> Changer de branche
    - git checkout -b blabla-new -> Créer une branche à partir de ta branche actuelle (a prioriser ?)
    - git push --set-upstream origin blabla -> Push ta branche local blabla sur le repo (Quand tu créer une branche elle est locale et existe pas encore la bas)
    - git branch -D <nom_branch> -> Pour delete la branche localement
    - git merge blabla -> Merge blabla dans ta branche actuelle -> git push pour appliquer sur le git
    - git push origin --delete <nom_branch> -> Pour delete la branche sur le git