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