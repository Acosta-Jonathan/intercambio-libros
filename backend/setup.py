# setup.py
from setuptools import setup, find_packages

setup(
    name="app",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2-binary",
        "python-dotenv",
        "python-jose[cryptography]",
        "passlib",
        "bcrypt",
        "pytest",
        "pytest-cov",
        "pydantic"
    ],
)