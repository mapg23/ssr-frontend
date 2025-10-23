
function CommentCard({
    comments,
    removeComment
}) {

    return (
        <div className="d-flex flex-column gap-3">
            {comments && comments.length > 0 ? (
                comments.map((comment, index) => (
                    <div
                        key={index}
                        className="bg-white border rounded-3 p-3 shadow-sm"
                        style={{
                            maxWidth: "420px",
                            fontFamily: "Arial, sans-serif",
                            fontSize: "14px",
                        }}
                    >

                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                className="form-control rounded-3"
                                placeholder="Titel"
                                value={comment.text || ""}
                            />
                            <label htmlFor="title">Titel</label>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => removeComment(comment.id)}
                            >
                                Ta bort
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted">No comments yet.</p>
            )}
        </div>
    );
}

export default CommentCard;