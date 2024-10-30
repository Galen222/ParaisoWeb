from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return "¡Hola, este es el backend en FastAPI!"