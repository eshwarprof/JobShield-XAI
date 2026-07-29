import pytest

from ai_service.bert_model import predict


def test_resolve_current_model_dir_raises_clear_error_when_untrained(monkeypatch, tmp_path):
    monkeypatch.setattr(predict, "MODELS_STORE_DIR", tmp_path)
    with pytest.raises(predict.ModelNotTrainedError):
        predict.resolve_current_model_dir()
