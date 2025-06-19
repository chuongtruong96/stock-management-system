package com.example.stationerymgntbe.repository;

import com.example.stationerymgntbe.dto.DepartmentUserCountDTO;
import com.example.stationerymgntbe.entity.Department;
import com.example.stationerymgntbe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Integer> {

    Optional<User> findByUsername(String username);

    Optional<User> findByDepartment_DepartmentId(Integer departmentId);
// Enhanced user queries with proper joins
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.username = :username")
    Optional<User> findByUsernameWithDepartmentAndRole(@Param("username") String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.userId = :id")
    Optional<User> findByIdWithDepartmentAndRole(@Param("id") Integer id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department ORDER BY u.username")
    List<User> findAllWithDepartmentAndRole();

    // Statistics queries
    long countByActiveTrue();
    
    // Department-based queries
    long countByDepartment(Department department);
    long countByDepartmentAndActiveTrue(Department department);

    @Query("SELECT new com.example.stationerymgntbe.dto.DepartmentUserCountDTO(d.departmentId, d.name, COUNT(u)) " +
           "FROM User u RIGHT JOIN u.department d " +
           "GROUP BY d.departmentId, d.name " +
           "ORDER BY COUNT(u) DESC")
    List<DepartmentUserCountDTO> getDepartmentUserCounts();
}
