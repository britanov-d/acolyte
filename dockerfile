#Download deps stage
#билд 1
FROM python:3.13.11-alpine AS build 

#Кронены
WORKDIR /deps #Кронены 

#сколько эндо нужно для билдОВ
COPY ./requirements.txt . 

#фарм нужного количества эндо (уже зафармлено)
RUN pip install --no-cache-dir --upgrade -r requirements.txt -t /deps 

#Final stage
#билд2
FROM python:3.13.11-alpine 

#Мисса прайм
WORKDIR /app 

#берем эндо из нафармленного
COPY --from=build /deps /usr/local/lib/python3.13/site-packages/ 

#фарм недостающих мистиков
COPY . . 

#100 часов в симуляруме
RUN python seed_db.py 

#поход сбоу 9999
CMD ["python", "app.py"] 
