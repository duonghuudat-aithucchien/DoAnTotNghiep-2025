import re


def redact(text):
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", "[email]", str(text))
    text = re.sub(r"(?<!\w)(?:\+84|0)[\d .-]{8,13}\d(?!\w)", "[phone]", text)
    text = re.sub(r"(?i)\b(?:bearer\s+)?eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b", "[token]", text)
    text = re.sub(r"(?i)(?:địa chỉ|dia chi)\s*[:=]\s*[^\n]+", "[address]", text)
    return text


def unsafe_instruction(text):
    lower = str(text).lower()
    patterns = [
        r"(ignore|disregard).{0,30}(instruction|prompt)",
        r"(bỏ qua|bo qua).{0,30}(hướng dẫn|huong dan|chỉ dẫn|chi dan)",
        r"(system prompt|api key|access_token|google_api_key|mongo_uri)",
        r"(xuất|in|hiện|show|print|reveal).{0,30}(mật khẩu|secret|token)",
    ]
    return any(re.search(pattern, lower) for pattern in patterns)

