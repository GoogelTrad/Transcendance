all: 
	@docker compose -f docker-compose.yml up --build


down:
	@docker compose -f docker-compose.yml down

re:
	@docker compose -f docker-compose.yml up --build

clean:
	@docker compose -f docker-compose.yml down
	@docker system prune -f -a --volumes

.PHONY: all re down clean