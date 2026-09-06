package dev.mariam123.movies;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;

@Service 
public class ReviewService {

    @Autowired 
    private ReviewRepository reviewRepository;

    @Autowired 
    private MongoTemplate mongoTemplate;
    
    public Review createReview(String reviewBody, String imdbId)
    {
        Review review = reviewRepository.insert(new Review(reviewBody));

        mongoTemplate.update(Movie.class)
        .matching(Criteria.where("imdbId").is(imdbId)) //where imdb id matches the provided imdbId by user
        .apply(new Update().push("reviewsIds").value(review))
        .first(); //update the first matching document
        

        return review;
    }
}
