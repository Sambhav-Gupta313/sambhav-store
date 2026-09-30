package com.sambhav.ecom_app.repository;

import com.sambhav.ecom_app.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users,Integer> {

Users findByUserEmail(String userEmail);
}
