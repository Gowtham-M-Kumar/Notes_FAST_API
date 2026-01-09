#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run migrations
export PYTHONPATH=$PYTHONPATH:.
alembic upgrade head
