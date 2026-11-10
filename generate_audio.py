import asyncio
import os
import edge_tts

VOICE = "pt-BR-AntonioNeural"
RATE = "-4%"
PITCH = "-2Hz"

CLIPS = {
    "bloom.mp3": "Inicie a pré-infusão com calma. Despeje a água em círculos lentos para abrir os aromas do café.",
    "pour_1.mp3": "Primeiro despejo. Mantenha o fluxo constante e contínuo no centro e em espiral suave.",
    "pour_2.mp3": "Segundo despejo. Controle o nível da água para uma extração doce e equilibrada.",
    "pour_3.mp3": "Terceiro despejo. Mantenha o ritmo calmo até o volume final da receita.",
    "pour_4.mp3": "Quarto despejo. Conduza o fluxo em círculos lentos para extrair as notas mais finas.",
    "pour_5.mp3": "Quinto despejo. Finalize com delicadeza.",
    "last_pour.mp3": "Último despejo concluído. Mantenha a água decantando suavemente e aguarde a drenagem total.",
    "finish.mp3": "Extração concluída com sucesso. Aproveite a sua xícara de café especial."
}

async def generate():
    out_dir = os.path.join(os.path.dirname(__file__), "audio")
    os.makedirs(out_dir, exist_ok=True)
    
    for filename, text in CLIPS.items():
        filepath = os.path.join(out_dir, filename)
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(filepath)
        size = os.path.getsize(filepath)
        print(f"Salvo: {filename} ({size} bytes)")

if __name__ == "__main__":
    asyncio.run(generate())
