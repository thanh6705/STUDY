import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaPlay, 
  FaCheck, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaList,
  FaRedo
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './QuestionSets.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function QuestionSets() {
  const [questionSets, setQuestionSets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [showQuiz, setShowQuiz] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    questions: []
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  const { token } = useAuth();

  const fetchQuestionSets = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questionsets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestionSets(response.data);
    } catch (error) {
      console.error('Error fetching question sets:', error);
      toast.error('Không thể tải đề ôn luyện');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchQuestionSets();
    }
  }, [fetchQuestionSets, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 câu hỏi');
      return;
    }
    try {
      if (editingSet) {
        await axios.put(`${API_URL}/api/questionsets/${editingSet._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật đề ôn luyện thành công');
      } else {
        await axios.post(`${API_URL}/api/questionsets`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tạo đề ôn luyện thành công');
      }
      fetchQuestionSets();
      setShowForm(false);
      setEditingSet(null);
      resetForm();
    } catch (error) {
      console.error('Error saving question set:', error);
      toast.error('Không thể lưu đề ôn luyện');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đề ôn luyện này?')) {
      try {
        await axios.delete(`${API_URL}/api/questionsets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchQuestionSets();
        toast.success('Đã xóa đề ôn luyện');
      } catch (error) {
        console.error('Error deleting question set:', error);
        toast.error('Không thể xóa đề ôn luyện');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      questions: []
    });
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setIsAddingQuestion(false);
    setEditingQuestionIndex(null);
    setShowQuestionList(false);
    setPreviewQuestionIndex(0);
  };

  const startAddQuestion = () => {
    if (formData.questions.length >= 80) {
      toast.error('Tối đa 80 câu hỏi trong 1 bộ');
      return;
    }
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setEditingQuestionIndex(null);
    setIsAddingQuestion(true);
  };

  const startEditQuestion = (index) => {
    setNewQuestion({ ...formData.questions[index] });
    setEditingQuestionIndex(index);
    setIsAddingQuestion(true);
  };

  const cancelAddQuestion = () => {
    setIsAddingQuestion(false);
    setEditingQuestionIndex(null);
  };

  const saveQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast.error('Vui lòng nhập câu hỏi');
      return;
    }
    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error('Vui lòng nhập đầy đủ 4 đáp án');
      return;
    }

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[editingQuestionIndex] = { ...newQuestion };
      setFormData({ ...formData, questions: updatedQuestions });
      toast.success(`Đã cập nhật câu ${editingQuestionIndex + 1}!`);
    } else {
      setFormData({
        ...formData,
        questions: [...formData.questions, { ...newQuestion }]
      });
      setPreviewQuestionIndex(formData.questions.length);
      toast.success('Đã thêm câu hỏi!');
    }

    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setIsAddingQuestion(false);
    setEditingQuestionIndex(null);
  };

  const saveQuestionAndContinue = () => {
    if (!newQuestion.question.trim()) {
      toast.error('Vui lòng nhập câu hỏi');
      return;
    }
    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error('Vui lòng nhập đầy đủ 4 đáp án');
      return;
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...newQuestion }]
    });
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setIsAddingQuestion(true);
    toast.success('Đã thêm câu hỏi! Tiếp tục tạo câu mới.');
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
    if (previewQuestionIndex >= newQuestions.length) {
      setPreviewQuestionIndex(Math.max(0, newQuestions.length - 1));
    }
  };

  const startQuiz = (set) => {
    setShowQuiz(set);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setReviewIndex(0);
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleFinishQuiz = () => {
    let correct = 0;
    showQuiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setQuizCompleted(true);
    setReviewIndex(0);
  };

  const renderQuiz = () => {
    if (!showQuiz) return null;

    if (quizCompleted) {
      const reviewQuestion = showQuiz.questions[reviewIndex];
      const userAns = selectedAnswers[reviewIndex];
      const isCorrect = userAns === reviewQuestion.correctAnswer;

      return (
        <div className="quiz-results">
          <h3>📊 Kết quả ôn tập</h3>
          <div className="score-display">
            <div className="score-number">{score}</div>
            <div className="score-total">/ {showQuiz.questions.length}</div>
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${(score / showQuiz.questions.length) * 100}%` }}></div>
          </div>
          <p className="score-message">
            {score === showQuiz.questions.length ? '🎉 Hoàn hảo! Bạn đã trả lời đúng tất cả!' :
             score >= showQuiz.questions.length * 0.8 ? '🌟 Tốt lắm! Bạn đã làm rất tốt!' :
             score >= showQuiz.questions.length * 0.6 ? '💪 Khá tốt! Cần cố gắng thêm!' :
             '📖 Bạn cần ôn tập thêm!'}
          </p>

          <div className="review-answers-section">
            <h4>Xem lại đáp án</h4>

            {/* Chi tiết câu hỏi xem lại */}
            <div className="review-single-card">
              <div className="review-card-header">
                <span className="q-badge">Câu {reviewIndex + 1} / {showQuiz.questions.length}</span>
                <span className={`status-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? 'Đúng' : 'Sai'}
                </span>
              </div>
              <h5 className="review-q-text">{reviewQuestion.question}</h5>
              <div className="review-options">
                {reviewQuestion.options.map((opt, oIdx) => {
                  let optClass = 'review-opt';
                  if (oIdx === reviewQuestion.correctAnswer) optClass += ' correct-target';
                  if (userAns === oIdx && !isCorrect) optClass += ' user-wrong';

                  return (
                    <div key={oIdx} className={optClass}>
                      <span className="opt-prefix">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                      {oIdx === reviewQuestion.correctAnswer && <FaCheck className="icon-right" />}
                      {userAns === oIdx && !isCorrect && <FaTimes className="icon-wrong" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Điều hướng câu xem lại */}
            <div className="review-navigation">
              <button
                type="button"
                className="nav-btn"
                disabled={reviewIndex === 0}
                onClick={() => setReviewIndex(reviewIndex - 1)}
              >
                <FaChevronLeft /> Câu trước
              </button>
              
              <div className="jump-input">
                <span>Đến câu:</span>
                <input
                  type="number"
                  min="1"
                  max={showQuiz.questions.length}
                  value={reviewIndex + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) - 1;
                    if (!isNaN(val) && val >= 0 && val < showQuiz.questions.length) {
                      setReviewIndex(val);
                    }
                  }}
                />
              </div>

              <button
                type="button"
                className="nav-btn"
                disabled={reviewIndex === showQuiz.questions.length - 1}
                onClick={() => setReviewIndex(reviewIndex + 1)}
              >
                Câu tiếp <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="results-actions">
            <button className="retry-btn" onClick={() => startQuiz(showQuiz)}>
              <FaRedo /> Làm lại bài
            </button>
            <button className="close-quiz-btn" onClick={() => setShowQuiz(null)}>Đóng</button>
          </div>
        </div>
      );
    }

    const question = showQuiz.questions[currentQuestionIndex];
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h3>{showQuiz.name}</h3>
          <div className="progress">
            Câu {currentQuestionIndex + 1} / {showQuiz.questions.length}
          </div>
        </div>

        <div className="question-container">
          <h4>{question.question}</h4>
          <div className="options-container">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="opt-letter">{String.fromCharCode(65 + index)}</span>
                <span className="opt-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Điều hướng làm bài */}
        <div className="quiz-navigation-bar">
          <button
            type="button"
            className="nav-btn"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <FaChevronLeft /> Trước
          </button>

          <div className="jump-input">
            <span>Đến câu:</span>
            <input
              type="number"
              min="1"
              max={showQuiz.questions.length}
              value={currentQuestionIndex + 1}
              onChange={(e) => {
                const val = parseInt(e.target.value) - 1;
                if (!isNaN(val) && val >= 0 && val < showQuiz.questions.length) {
                  setCurrentQuestionIndex(val);
                }
              }}
            />
          </div>

          {currentQuestionIndex < showQuiz.questions.length - 1 ? (
            <button
              type="button"
              className="nav-btn primary"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            >
              Tiếp <FaChevronRight />
            </button>
          ) : (
            <button
              type="button"
              className="finish-btn"
              onClick={handleFinishQuiz}
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>
    );
  };

  const previewQuestion = formData.questions[previewQuestionIndex];

  return (
    <div className="question-sets-container">
      <div className="question-sets-header">
        <h2>📚 Đề ôn luyện</h2>
        <button className="create-set-btn" onClick={() => {
          resetForm();
          setEditingSet(null);
          setShowForm(true);
        }}>
          <FaPlus /> Tạo đề mới
        </button>
      </div>

      <div className="sets-grid">
        {questionSets.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có đề ôn luyện nào. Hãy tạo đề đầu tiên!</p>
          </div>
        ) : (
          questionSets.map(set => (
            <div key={set._id} className="set-card">
              <div className="set-card-header">
                <h3>{set.name}</h3>
                <span className="question-count">{set.questions.length} câu hỏi</span>
              </div>
              {set.description && <p className="set-description">{set.description}</p>}
              <div className="set-actions">
                <button className="practice-btn" onClick={() => startQuiz(set)}>
                  <FaPlay /> Ôn tập
                </button>
                <button className="edit-btn" onClick={() => {
                  setEditingSet(set);
                  setFormData({
                    name: set.name,
                    description: set.description || '',
                    questions: JSON.parse(JSON.stringify(set.questions))
                  });
                  setPreviewQuestionIndex(0);
                  setShowQuestionList(true);
                  setShowForm(true);
                }}>
                  <FaEdit /> Sửa
                </button>
                <button className="delete-btn" onClick={() => handleDelete(set._id)}>
                  <FaTrash /> Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingSet(null);
        }}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSet ? '✏️ Sửa đề ôn luyện' : '📝 Tạo đề ôn luyện mới'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => {
                setShowForm(false);
                setEditingSet(null);
              }} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên đề ôn luyện</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nhập tên đề ôn luyện"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả (không bắt buộc)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả đề ôn luyện"
                  rows={2}
                />
              </div>

              <div className="questions-section">
                <div className="questions-header">
                  <h4>Danh sách câu hỏi ({formData.questions.length}/80)</h4>
                  <div className="questions-header-actions">
                    <button 
                      type="button" 
                      className="add-question-btn"
                      onClick={startAddQuestion}
                      disabled={isAddingQuestion}
                    >
                      <FaPlus /> Thêm câu hỏi
                    </button>
                    {formData.questions.length > 0 && (
                      <button
                        type="button"
                        className="toggle-question-list-btn"
                        onClick={() => setShowQuestionList(!showQuestionList)}
                      >
                        <FaList /> {showQuestionList ? 'Ẩn xem lại' : 'Xem chi tiết'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Nhập/Sửa câu hỏi */}
                {isAddingQuestion && (
                  <div className="add-question-form">
                    <div className="preview-card-header">
                      <span className="q-badge">
                        {editingQuestionIndex !== null ? `Sửa Câu ${editingQuestionIndex + 1}` : `Câu ${formData.questions.length + 1}`}
                      </span>
                    </div>

                    {/* Dùng Textarea rộng rãi hỗ trợ câu hỏi dài */}
                    <div className="form-group" style={{ marginTop: '12px' }}>
                      <label>Nội dung câu hỏi</label>
                      <textarea
                        className="question-textarea"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                        placeholder="Nhập câu hỏi (hỗ trợ văn bản dài)..."
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label>Các đáp án</label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="option-input-group">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOptions});
                            }}
                            placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                          />
                          <label className="correct-label">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={newQuestion.correctAnswer === index}
                              onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                            />
                            Đúng
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-cancel" onClick={cancelAddQuestion}>Hủy</button>
                      <button type="button" className="btn-save" onClick={saveQuestion}>
                        <FaCheck /> Hoàn tất
                      </button>
                      {editingQuestionIndex === null && (
                        <button type="button" className="btn-save-more" onClick={saveQuestionAndContinue}>
                          <FaPlus /> Lưu & Thêm tiếp
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Chế độ Xem & Chuyển câu */}
                {formData.questions.length > 0 && showQuestionList && !isAddingQuestion && (
                  <div className="questions-browser-view">
                    {previewQuestion && (
                      <div className="preview-single-card">
                        <div className="preview-card-header">
                          <span className="q-badge">Câu {previewQuestionIndex + 1} / {formData.questions.length}</span>
                          <div className="q-actions">
                            <button 
                              type="button" 
                              className="edit-q-btn" 
                              onClick={() => startEditQuestion(previewQuestionIndex)}
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button 
                              type="button" 
                              className="delete-q-btn" 
                              onClick={() => removeQuestion(previewQuestionIndex)}
                            >
                              <FaTrash /> Xóa
                            </button>
                          </div>
                        </div>

                        <p className="q-preview-text">{previewQuestion.question}</p>

                        <div className="q-preview-options">
                          {previewQuestion.options.map((opt, oi) => (
                            <div key={oi} className={`q-preview-opt ${previewQuestion.correctAnswer === oi ? 'correct' : ''}`}>
                              <span className="opt-code">{String.fromCharCode(65 + oi)}.</span> {opt}
                            </div>
                          ))}
                        </div>

                        {/* Thanh điều hướng câu */}
                        <div className="card-navigation">
                          <button
                            type="button"
                            className="nav-btn"
                            disabled={previewQuestionIndex === 0}
                            onClick={() => setPreviewQuestionIndex(previewQuestionIndex - 1)}
                          >
                            <FaChevronLeft /> Câu trước
                          </button>

                          <div className="jump-input">
                            <span>Đến câu:</span>
                            <input
                              type="number"
                              min="1"
                              max={formData.questions.length}
                              value={previewQuestionIndex + 1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) - 1;
                                if (!isNaN(val) && val >= 0 && val < formData.questions.length) {
                                  setPreviewQuestionIndex(val);
                                }
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            className="nav-btn"
                            disabled={previewQuestionIndex === formData.questions.length - 1}
                            onClick={() => setPreviewQuestionIndex(previewQuestionIndex + 1)}
                          >
                            Câu tiếp <FaChevronRight />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formData.questions.length === 0 && !isAddingQuestion && (
                  <p className="empty-questions">Chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi" để bắt đầu!</p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowForm(false);
                  setEditingSet(null);
                }}>Hủy</button>
                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={formData.questions.length === 0}
                >
                  {editingSet ? 'Cập nhật đề' : 'Lưu đề ôn luyện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuiz && (
        <div className="modal-overlay" onClick={() => {
          if (quizCompleted) setShowQuiz(null);
        }}>
          <div className="modal-content quiz-modal" onClick={e => e.stopPropagation()}>
            {renderQuiz()}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionSets;