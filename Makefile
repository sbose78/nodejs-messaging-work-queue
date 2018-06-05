.PHONY: help
help:
	@echo "run             Run all the components using a test broker"
	@echo "clean           Removes build and test artifacts"

.PHONY: run
run:
	scripts/run-all

.PHONY: clean
clean:
	cd frontend && make clean
	cd worker && make clean

README.html: README.md
	pandoc $< -o $@
