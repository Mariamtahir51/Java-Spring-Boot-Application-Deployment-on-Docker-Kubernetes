package dev.mariam123.movies;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private ObjectId id;

    @Indexed(unique = true) //Indexed annotation is used to create an index on the email field, and the unique = true attribute ensures that the email values are unique across all documents in the collection.
    private String email;

    private String username;

    private String passwordHash;
}
