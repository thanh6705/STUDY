import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './QuestionSets.css';

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
  // State cho việc thêm câu hỏi mới
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const { token } = useAuth();

  const fetchQuestionSets = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questionsets', {
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
        await axios.put(`http://localhost:5000/api/questionsets/${editingSet._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cập nhật đề ôn luyện thành công');
      } else {
        await axios.post('http://localhost:5000/api/questionsets', formData, {
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
        await axios.delete(`http://localhost:5000/api/questionsets/${id}`, {
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
    setShowQuestionList(false);
  };

  // Bắt đầu thêm câu hỏi mới
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
    setIsAddingQuestion(true);
  };

  // Hủy thêm câu hỏi
  const cancelAddQuestion = () => {
    setIsAddingQuestion(false);
  };

  // Lưu câu hỏi vào danh sách
  const saveQuestion = () => {
    // Validate
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
    setIsAddingQuestion(false);
    setShowQuestionList(false);
    toast.success('Đã thêm câu hỏi!');
  };

  const saveQuestionAndContinue = () => {
    // Validate
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
    setShowQuestionList(false);
    toast.success('Đã thêm câu hỏi! Tiếp tục tạo câu mới.');
  };

  // Xóa câu hỏi khỏi danh sách
  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const startQuiz = (set) => {
    setShowQuiz(set);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < showQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      let correct = 0;
      showQuiz.questions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
          correct++;
        }
      });
      setScore(correct);
      setQuizCompleted(true);
    }
  };

  const renderQuiz = () => {
    if (!showQuiz) return null;

    if (quizCompleted) {
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
          <div className="review-answers">
            <h4>Xem lại đáp án</h4>
            {showQuiz.questions.map((q, index) => (
              <div key={index} className="review-item">
                <p><strong>Câu {index + 1}:</strong> {q.question}</p>
                <p className={selectedAnswers[index] === q.correctAnswer ? 'correct' : 'incorrect'}>
                  Đáp án bạn chọn: {q.options[selectedAnswers[index]] || 'Chưa chọn'}
                </p>
                {selectedAnswers[index] !== q.correctAnswer && (
                  <p className="correct-answer">Đáp án đúng: {q.options[q.correctAnswer]}</p>
                )}
              </div>
            ))}
          </div>
          <button className="close-quiz-btn" onClick={() => setShowQuiz(null)}>Đóng</button>
        </div>
      );
    }

    const question = showQuiz.questions[currentQuestionIndex];
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h3>{showQuiz.name}</h3>
          <div className="progress">
            Câu {currentQuestionIndex + 1}/{showQuiz.questions.length}
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
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        </div>
        <div className="quiz-navigation">
          <button 
            className="next-btn"
            onClick={nextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
          >
            {currentQuestionIndex === showQuiz.questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="question-sets-container">
      <div className="question-sets-header">
        <h2>📚 Đề ôn luyện</h2>
        <button className="create-set-btn" onClick={() => {
          resetForm();
          setEditingSet(null);
          setShowQuestionList(false);
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
                  setShowQuestionList(false);
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
                        {showQuestionList ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                      </button>
                    )}
                  </div>
                </div>

                {formData.questions.length > 0 && !showQuestionList && (
                  <div className="questions-summary">
                    Đã thêm {formData.questions.length} câu hỏi. Vui lòng lưu để xem chi tiết.
                  </div>
                )}

                {/* Form thêm câu hỏi mới */}
                {isAddingQuestion && (
                  <div className="add-question-form">
                    <div className="question-number">
                      <h4>Câu {formData.questions.length + 1}</h4>
                    </div>
                    <div className="form-group">
                      <label>Câu hỏi</label>
                      <input
                        type="text"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                        placeholder="Nhập câu hỏi"
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
                              checked={newQuestion.correctAnswer === index}
                              onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                            />
                            Đúng
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={cancelAddQuestion}>Hủy</button>
                      <button type="button" onClick={saveQuestion}>
                        <FaCheck /> Hoàn tất
                      </button>
                      <button type="button" onClick={saveQuestionAndContinue}>
                        <FaCheck /> Thêm và tiếp tục
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách câu hỏi đã thêm */}
                {formData.questions.length > 0 && showQuestionList && (
                  <div className="questions-list">
                    {formData.questions.map((q, index) => (
                      <div key={index} className="question-preview">
                        <div className="question-preview-header">
                          <span className="q-number">Câu {index + 1}</span>
                          <button 
                            type="button"
                            onClick={() => removeQuestion(index)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <p className="q-text">{q.question}</p>
                        <div className="q-options">
                          {q.options.map((opt, oi) => (
                            <span key={oi} className={`q-option ${q.correctAnswer === oi ? 'correct' : ''}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.questions.length === 0 && !isAddingQuestion && (
                  <p className="empty-questions">Chưa có câu hỏi nào. Hãy thêm câu hỏi!</p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingSet(null);
                }}>Hủy</button>
                <button 
                  type="submit"
                  disabled={formData.questions.length === 0}
                >
                  {editingSet ? 'Cập nhật đề ôn luyện' : 'Lưu đề ôn luyện'}
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