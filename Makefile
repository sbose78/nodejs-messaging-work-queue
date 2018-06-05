.PHONY: help
help:
	@echo "run             Run all the component programs with a test broker"
	@echo "clean           Removes build and test outputs"

.PHONY: run
run:
	scripts/run-all

.PHONY: clean
clean:
	cd frontend && make clean
	cd worker && make clean
