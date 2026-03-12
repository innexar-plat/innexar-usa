"""Unit tests for HestiaCP client (mocked HTTP)."""

from unittest.mock import MagicMock, patch

import pytest
from app.providers.hestia.client import HestiaClient


@pytest.fixture
def client() -> HestiaClient:
    return HestiaClient(
        base_url="https://hestia.example.com",
        access_key="ak",
        secret_key="sk",
    )


def test_request_sends_cmd_and_args(client: HestiaClient) -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"hestia-exit-code": "0"}
    mock_resp.json.return_value = {"returncode": 0, "answer": []}
    mock_resp.raise_for_status = MagicMock()

    with patch("app.providers.hestia.client.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        result = client.request("v-list-users", arg1="admin")
    assert result == {"returncode": 0, "answer": []}
    call_kw = mock_client_class.return_value.__enter__.return_value.post.call_args
    assert call_kw[0][0] == "https://hestia.example.com/api/"
    payload = call_kw[1]["data"]
    assert payload["hash"] == "ak:sk"
    assert payload["cmd"] == "v-list-users"
    assert payload["returncode"] == "yes"


def test_request_raises_on_nonzero_returncode(client: HestiaClient) -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"hestia-exit-code": "1"}
    mock_resp.json.return_value = {"returncode": 1, "stderr": "User exists"}
    mock_resp.raise_for_status = MagicMock()

    with patch("app.providers.hestia.client.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        with pytest.raises(RuntimeError, match="Hestia .* failed"):
            client.request(
                "v-add-user", arg1="u", arg2="p", arg3="e@x.com", arg4="default"
            )


def test_create_user_calls_v_add_user(client: HestiaClient) -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"hestia-exit-code": "0"}
    mock_resp.json.return_value = {"returncode": 0}
    mock_resp.raise_for_status = MagicMock()

    with patch("app.providers.hestia.client.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        client.create_user(
            user="cust1_site", password="pwd", email="u@x.com", package="default"
        )
    payload = mock_client_class.return_value.__enter__.return_value.post.call_args[1][
        "data"
    ]
    assert payload["cmd"] == "v-add-user"
    assert payload["arg1"] == "cust1_site"
    assert payload["arg2"] == "pwd"
    assert payload["arg3"] == "u@x.com"
    assert payload["arg4"] == "default"


def test_suspend_user_calls_v_suspend_user(client: HestiaClient) -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"hestia-exit-code": "0"}
    mock_resp.json.return_value = {"returncode": 0}
    mock_resp.raise_for_status = MagicMock()

    with patch("app.providers.hestia.client.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        client.suspend_user("cust1_site")
    payload = mock_client_class.return_value.__enter__.return_value.post.call_args[1][
        "data"
    ]
    assert payload["cmd"] == "v-suspend-user"
    assert payload["arg1"] == "cust1_site"


def test_unsuspend_user_calls_v_unsuspend_user(client: HestiaClient) -> None:
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.headers = {"hestia-exit-code": "0"}
    mock_resp.json.return_value = {"returncode": 0}
    mock_resp.raise_for_status = MagicMock()

    with patch("app.providers.hestia.client.httpx.Client") as mock_client_class:
        mock_client_class.return_value.__enter__.return_value.post.return_value = (
            mock_resp
        )
        client.unsuspend_user("cust1_site")
    payload = mock_client_class.return_value.__enter__.return_value.post.call_args[1][
        "data"
    ]
    assert payload["cmd"] == "v-unsuspend-user"
    assert payload["arg1"] == "cust1_site"
