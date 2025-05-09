import json
import logging
import datetime as dt
from typing import Dict, Any, Optional

class UvicornJSONFormatter(logging.Formatter):
    """
    JSON formatter for Uvicorn logs.
    """
    def __init__(self, fmt_keys: Optional[Dict[str, str]] = None):
        super().__init__()
        self.fmt_keys = fmt_keys if fmt_keys is not None else {}

    def format(self, record: logging.LogRecord) -> str:
        message = self._prepare_log_dict(record)
        return json.dumps(message, default=str)

    def _prepare_log_dict(self, record: logging.LogRecord) -> Dict[str, Any]:
        message = {
            "level": logging.getLevelName(record.levelno),
            "severity": logging.getLevelName(record.levelno),
            "message": record.getMessage(),
            "timestamp": dt.datetime.fromtimestamp(record.created, tz=dt.timezone.utc).isoformat(),
            "logger": record.name,
        }
        
        # Add exception info if available
        if record.exc_info:
            message["exc_info"] = self.formatException(record.exc_info)
        
        # Add stack info if available
        if record.stack_info:
            message["stack_info"] = self.formatStack(record.stack_info)
            
        # Add other record attributes that might be useful
        if hasattr(record, "module") and record.module:
            message["module"] = record.module
        if hasattr(record, "funcName") and record.funcName:
            message["function"] = record.funcName
        if hasattr(record, "lineno") and record.lineno:
            message["line"] = record.lineno
        if hasattr(record, "threadName") and record.threadName:
            message["thread_name"] = record.threadName
            
        return message
