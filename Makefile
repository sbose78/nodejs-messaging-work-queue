.PHONY: help
help:
	@echo "Targets: run, clean"

.PHONY: run
run:
	scripts/run-all

.PHONY: clean
clean:
	cd frontend && make clean
	cd worker && make clean
