package dev.mariam123.movies;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Review {

    @Id
    private ObjectId id;

    private String body;

    public Review(String body) {
        this.body = body;
    }
}