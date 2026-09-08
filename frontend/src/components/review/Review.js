import {useEffect} from 'react';
import api from '../../api/axiosConfig';
import {useParams} from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap';
import ReviewForm from '../reviewForm/ReviewForm';

import React from 'react'

const Reviews = ({getMovieData,movie,reviews,setReviews}) => {

    let params = useParams();
    const movieId = params.movieId;

    useEffect(()=>{
        getMovieData(movieId);
    },[])

    const addReview = async (reviewBody) =>{
        try
        {
            await api.post("/api/v1/reviews",{reviewBody,imdbId:movieId});

            setReviews((currentReviews) => [
                ...(currentReviews ?? []),
                {body: reviewBody}
            ]);
            return true;
        }
        catch(err)
        {
            console.error(err);
            return false;
        }
        



    }

  return (
    <Container>
        <Row>
            <Col><h3>Reviews</h3></Col>
        </Row>
        <Row className="mt-2">
            <Col>
                <img src={movie?.poster} alt="" />
            </Col>
            <Col>
                {
                    <>
                        <Row>
                            <Col>
                                <ReviewForm handleSubmit={addReview} labelText="Write a Review?" />  
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <hr />
                            </Col>
                        </Row>
                    </>
                }
                {
                    reviews?.map((r) => {
                        return(
                            <>
                                <Row>
                                    <Col>{r.body}</Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <hr />
                                    </Col>
                                </Row>                                
                            </>
                        )
                    })
                }
            </Col>
        </Row>
        <Row>
            <Col>
                <hr />
            </Col>
        </Row>        
    </Container>
  )
}

export default Reviews
