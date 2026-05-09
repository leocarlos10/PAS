# Guia basica para trabajar en este proyecto.

# 1. Mantener la rama main actualizada
git switch main
git pull origin main

# 2. Crear tu rama para trabajar. 
git switch -c feature/login-pantalla

# Trabajas y guardas tus cambios en la rama. 

git commit -m "feat: crear pantalla de login"
git commit -m "fix: corregir responsive"


# 3. ANTES DE SUBIR 
git switch main
git pull origin main  
git switch feature/login-pantalla
git merge main 

Se hace  merge de main en caso de conflictos para solucionarlos localmente.   

# 4. Subir cambios
git push origin feature/login-pantalla

# 5. Crear pull request. 
Importante que luego de crear la pull request. 
Crear un Squash and merge  en caso de tener varios commits en la rama. 
Fucionarlos a un solo commit en la rama main. 

# Importante.
Si la rama se **fusionó** (mergeó) y cumplió su propósito, eliminarla de GitHub luego
del merge. Además de local.

Solo existirá una rama main y las ramas que se utilicen serán de funcionalidades que se agreguen.
Evitar mezclar distintas funcionalidades o correcciones de distinta naturaleza en una sola rama.


# Advertencia. 
No haga push directos main bajo ninguna cirscustancia.