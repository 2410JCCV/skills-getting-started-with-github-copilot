# Getting Started with GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey 2410JCCV!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/2410JCCV/skills-getting-started-with-github-copilot/issues/1)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

## Ejecutar la aplicación localmente

1. Crear e activar un entorno virtual (opcional pero recomendado):

	```bash
	python -m venv .venv
	source .venv/bin/activate
	```

2. Instalar dependencias:

	```bash
	pip install -r requirements.txt
	```

3. Iniciar la aplicación con uvicorn:

	```bash
	python -m uvicorn src.app:app --host 127.0.0.1 --port 8000 --reload
	```

4. Abrir en el navegador:

	- Aplicación: http://127.0.0.1:8000/
	- Documentación automática (Swagger): http://127.0.0.1:8000/docs

Nota: Este ejercicio no incluye tests automatizados en el repositorio; puedes explorar la app manualmente usando las rutas anteriores.

