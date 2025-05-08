from ._config import setup_logging
from ._formatter import PhoenixJSONFormatter

# Import the new Uvicorn JSON formatter
try:
    from .uvicorn_json_formatter import UvicornJSONFormatter
    __all__ = ["setup_logging", "PhoenixJSONFormatter", "UvicornJSONFormatter"]
except ImportError:
    __all__ = ["setup_logging", "PhoenixJSONFormatter"]
