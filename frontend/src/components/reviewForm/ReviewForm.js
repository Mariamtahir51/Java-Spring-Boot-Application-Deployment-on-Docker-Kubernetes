import { useState } from 'react';
import {Form,Button} from 'react-bootstrap';

const ReviewForm = ({handleSubmit,labelText}) => {
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitReview = async (event) => {
    event.preventDefault();
    const wasSubmitted = await handleSubmit(review);

    if (wasSubmitted) {
      setReview('');
      setSubmitted(true);
    }
  };

  return (

    <Form onSubmit={submitReview}>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>{labelText}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={review}
              onChange={(event) => {
                setReview(event.target.value);
                setSubmitted(false);
              }}
            />
        </Form.Group>
        <Button variant="outline-info" type="submit">
          {submitted ? 'Submitted' : 'Submit'}
        </Button>
    </Form>   

  )
}

export default ReviewForm
