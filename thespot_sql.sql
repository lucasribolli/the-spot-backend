CREATE TABLE EMPLOYEES(
    EMAIL VARCHAR(100) NOT NULL PRIMARY KEY
)

CREATE TABLE SEATS(
    ID SERIAL PRIMARY KEY,
    STATUS VARCHAR(20) NOT NULL
)

CREATE TABLE RESERVATIONS(
    ID SERIAL PRIMARY KEY,
    CREATED_AT DATE NOT NULL,
    RESERVATION_DATE DATE NOT NULL,
    STATUS VARCHAR(15) NOT NULL,
    EMPLOYEE_EMAIL VARCHAR(100),
    ID_SEAT INT,
    CONSTRAINT fk_employee_email FOREIGN KEY(EMPLOYEE_EMAIL) REFERENCES EMPLOYEES(EMAIL),
    CONSTRAINT fk_seat_id FOREIGN KEY(ID_SEAT) REFERENCES SEATS(ID)
)
