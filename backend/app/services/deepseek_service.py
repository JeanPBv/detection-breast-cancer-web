import httpx
import os
from dotenv import load_dotenv

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

def interpretation_deepseek(resultados: dict) -> str:
    prompt = f"""
    A partir del análisis de imágenes histopatológicas se obtuvieron los siguientes resultados:

    - Benigno: {resultados.get('Benigno', 0):.2f}%
    - Carcinoma ductal: {resultados.get('Carcinoma ductal', 0):.2f}%
    - Carcinoma lobulillar: {resultados.get('Carcinoma lobulillar', 0):.2f}%

    Redacta una interpretación preliminar médica real, concisa y detallada.
    """

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "Eres un asistente médico experto en patología clínica."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 300
    }

    try:
        response = httpx.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("Error con DeepSeek:", e)
        return "No se pudo generar una interpretación en este momento."