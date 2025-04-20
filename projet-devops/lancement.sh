if [ -z "$1" ]; then
    echo "Manque argument "go" ou "finish""
elif [ "$1" = "go" ]; then
    echo "Début du projet"
    docker compose up -d
    sleep 5
    cd kafka
    docker compose up -d 
    sleep 5
    cd stock
    docker compose up -d --build #pour charger notre nouvelle configuration de mise à jour des stocks
    sleep 5

elif [ "$1" = "finish" ]; then
    cd kafka/stock
    docker compose down
    sleep 5
    cd ..
    docker compose down
    sleep 5 
    cd ..
    docker compose down

    echo "Fin du projet!"
else
    echo "Argument non reconnu"
fi