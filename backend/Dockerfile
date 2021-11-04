FROM python:3.8.12-buster

RUN python -m pip install --upgrade pip

RUN pip install pipenv

COPY . .

RUN pipenv install --system --deploy

EXPOSE 5000

CMD ["pipenv", "run", "flask", "run"]