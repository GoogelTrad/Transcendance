all: 
	mkdir -p db certs
	@docker compose -f docker-compose.yml up --build -d
	@docker compose logs -f

down:
	@docker compose -f docker-compose.yml down

re: clean
	@docker compose -f docker-compose.yml up --build

clean:
	@docker compose -f docker-compose.yml down
	@docker system prune -f -a --volumes

.PHONY: all re down clean