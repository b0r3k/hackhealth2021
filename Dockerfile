FROM python:3.9-slim

RUN apt install git \
    && pip install nltk huggingface transformers torch