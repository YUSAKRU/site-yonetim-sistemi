import React, { useState, useEffect } from 'react';
import { ClipboardList, Play, CheckCircle, Clock } from 'lucide-react';
import { getStaffTickets, updateTicketStatus } from '../../services/ticketService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { getCategoryById, getStatusById } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/helpers';

const StaffTasks = ({ user }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        loadTasks();
    }, [user]);

    const loadTasks = async () => {
        try {
            const data = await getStaffTickets(user.uid);
            setTickets(data);
        } catch (error) {
            console.error('Error loading staff tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (ticketId, nextStatus) => {
        setUpdatingId(ticketId);
        try {
            await updateTicketStatus(ticketId, nextStatus, user.uid);
            await loadTasks();
        } catch (err) {
            console.error('Error updating task status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="animate-fade-in-up">
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Atanan Görevlerim</h1>

            <Card>
                {tickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-tertiary)' }}>
                        <ClipboardList size={48} style={{ margin: '0 auto var(--spacing-md)' }} />
                        <p>Henüz size atanmış bir görev bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-md">
                        {tickets.map((ticket, index) => {
                            const category = getCategoryById(ticket.category);
                            const status = getStatusById(ticket.status);
                            const delayClass = `delay-${(index % 4) + 1}`;

                            return (
                                <div key={ticket.id} className={`glass-list-item animate-fade-in-up ${delayClass}`}>
                                    <div className="flex justify-between items-start">
                                        <div style={{ flex: 1 }}>
                                            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                <span style={{ fontSize: 'var(--font-size-lg)' }}>{category.icon}</span>
                                                <h4 style={{ margin: 0 }}>{ticket.title}</h4>
                                            </div>
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                {ticket.description}
                                            </p>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                                <strong>Konum:</strong> {ticket.block} Blok, Daire {ticket.flat_no} • <strong>Talep Tarihi:</strong> {formatRelativeTime(ticket.created_at)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-sm">
                                            <Badge variant={ticket.status}>
                                                {status.label}
                                            </Badge>

                                            {/* Action Buttons for Staff */}
                                            <div style={{ display: 'flex', gap: '6px', marginTop: 'var(--spacing-xs)' }}>
                                                {ticket.status === 'assigned' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        icon={<Play size={14} />}
                                                        disabled={updatingId !== null}
                                                        onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                                                        style={{ background: 'var(--color-secondary)' }}
                                                    >
                                                        İşe Başla
                                                    </Button>
                                                )}

                                                {['assigned', 'in_progress'].includes(ticket.status) && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        icon={<CheckCircle size={14} />}
                                                        disabled={updatingId !== null}
                                                        onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                                    >
                                                        Tamamla
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StaffTasks;
