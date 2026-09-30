FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

EXPOSE 8089

CMD ["java", "-jar", "target/ecom-app-0.0.1-SNAPSHOT.jar"]