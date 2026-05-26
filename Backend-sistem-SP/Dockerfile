FROM gradle:jdk25-noble AS build

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY src src

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /app/build/libs/*.jar /app/app.jar

EXPOSE 8080
ENV SERVER_PORT=8080

CMD ["java", "-jar", "/app/app.jar"]
