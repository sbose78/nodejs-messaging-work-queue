.PHONY: build
default: build

.PHONY: help
help:
	@echo "run             Run all the components using a test broker"
	@echo "clean           Removes build and test artifacts"

.PHONY: build
build:
	cd frontend && npm install
	cd worker && npm install

.PHONY: run
run:
	scripts/run

.PHONY: clean
clean:
	cd frontend && rm -rf node_modules
	cd worker && rm -rf node_modules

README.html: README.md
	pandoc $< -o $@
