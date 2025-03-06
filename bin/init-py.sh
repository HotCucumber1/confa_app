#!/bin/bash

python -m venv maildump
./maildump/bin/pip install -U pip setuptools wheel
./maildump/bin/pip install maildump
./maildump/bin/maildump -p /tmp/maildump.pid

source .venv/bin/activate
pip install -r requirements.txt
pip install -U pip setuptools wheel
pip install -e '.[dev]'
npm ci

indico i18n compile indico
