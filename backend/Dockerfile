FROM python:3.8.12-buster

RUN python -m pip install --upgrade pip

RUN pip install pipenv

COPY . .

RUN pipenv install --system --deploy

EXPOSE 5000

# CMD ["pipenv", "run", "flask", "run", "--host=0.0.0.0", "--port=5000"]
CMD ["pipenv", "run", "gunicorn", "-w", "1", "--threads", "100", "-t", "0", "app:app"]