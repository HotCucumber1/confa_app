# This file is part of Indico.
# Copyright (C) 2002 - 2025 CERN
#
# Indico is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see the
# LICENSE file for more details.

from datetime import datetime

import pytest
import pytz
from marshmallow import ValidationError

from indico.util.marshmallow import NaiveDateTime


def test_NaiveDateTime_serialize():
    utc_now = datetime.now(pytz.UTC)
    now = utc_now.replace(tzinfo=None)
    obj = type('Test', (), {
        'naive': now,
        'aware': utc_now,
    })
    field = NaiveDateTime()
    assert field.serialize('naive', obj) == now.isoformat()
    with pytest.raises(AssertionError):
        field.serialize('aware', obj)


def test_NaiveDateTime_deserialize():
    utc_now = datetime.now(pytz.UTC)
    now = utc_now.replace(tzinfo=None)
    field = NaiveDateTime()
    assert field.deserialize(now.isoformat()) == now
    with pytest.raises(ValidationError):
        field.deserialize(utc_now.isoformat())
