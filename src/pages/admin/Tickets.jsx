import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, UserPlus } from 'lucide-react';
import { getAllTickets, assignTicket, getTicketLogs } from '../../services/ticketService';
import { getStaffMembers } from '../../services/userService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { CATEGORIES, STATUSES, getCategoryById, getStatusById } from '../../utils/constants';
import { formatDate, formatRelativeTime } from '../../utils/helpers';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [blockFilter, setBlockFilter] = useState('');

    // Modal state
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketLogs, setTicketLogs] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [tickets, searchTerm, statusFilter, categoryFilter, blockFilter]);

    const loadData = async () => {
        try {
            const [ticketsData, staffData] = await Promise.all([
                getAllTickets(),
                getStaffMembers()
            ]);
            setTickets(ticketsData);
            setStaffList(staffData);
        } catch (error) {
            console.error('Error loading tickets data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let filtered = [...tickets];

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        if (categoryFilter) {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        if (blockFilter) {
            filtered = filtered.filter(t => t.block === blockFilter);
        }

        setFilteredTickets(filtered);
    };

    const handleOpenDetail = async (ticket) => {
        setSelectedTicket(ticket);
        setSelectedStaff(ticket.assigned_to || '');
        setModalOpen(true);
        try {
            const logs = await getTicketLogs(ticket.id);
            setTicketLogs(logs);
        } catch (err) {
            console.error('Error loading ticket logs:', err);
        }
    };

    const handleAssign = async () => {
        if (!selectedTicket || !selectedStaff) return;
        setAssigning(true);
        try {
            const adminId = 'mock-admin-uid';
            await assignTicket(selectedTicket.id, selectedStaff, adminId);
            
            const updatedTickets = await getAllTickets();
            setTickets(updatedTickets);
            
            const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
            setSelectedTicket(updatedTicket);
            
            const logs = await getTicketLogs(selectedTicket.id);
            setTicketLogs(logs);
        } catch (err) {
            console.error('Assignment error:', err);
        } finally {
            setAssigning(false);
        }
    };

    const statusOptions = [
        { value: '', label: 'Tüm Durumlar' },
        ...Object.values(STATUSES).map(status => ({
            value: status.id,
            label: status.label,
        })),
    ];

    const categoryOptions = [
        { value: '', label: 'Tüm Kategoriler' },
        ...Object.values(CATEGORIES).map(cat => ({
            value: cat.id,
            label: cat.label,
        })),
    ];

    const blockOptions = [
        { value: '', label: 'Tüm Bloklar' },
        { value: 'A', label: 'A Blok' },
        { value: 'B', label: 'B Blok' },
        { value: 'C', label: 'C Blok' },
        { value: 'D', label: 'D Blok' },
    ];

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="animate-fade-in-up">
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Tüm Talepler</h1>

            {/* Filters Bar */}
            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="grid grid-cols-4 gap-md">
                    <div style={{ position: 'relative' }}>
                        <Input
                            placeholder="Talep ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-tertiary)',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={statusOptions}
                        placeholder="Durum Filtrele"
                    />

                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        options={categoryOptions}
                        placeholder="Kategori Filtrele"
                    />

                    <Select
                        value={blockFilter}
                        onChange={(e) => setBlockFilter(e.target.value)}
                        options={blockOptions}
                        placeholder="Blok Filtrele"
                    />
                </div>
            </Card>

            {/* Tickets Table */}
            <Card>
                {filteredTickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-tertiary)' }}>
                        <Filter size={48} style={{ margin: '0 auto var(--spacing-md)' }} />
                        <p>Kriterlere uygun talep bulunamadı.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Oluşturulma</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Talep Sahibi</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Başlık</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Kategori</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Konum</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Durum</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket, index) => {
                                    const category = getCategoryById(ticket.category);
                                    const status = getStatusById(ticket.status);
                                    const delayClass = `delay-${(index % 4) + 1}`;

                                    return (
                                        <tr key={ticket.id} className={`animate-fade-in-up ${delayClass}`}>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {formatDate(ticket.created_at)}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>
                                                {ticket.block} Blok Daire {ticket.flat_no}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ticket.title}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {category.icon} {category.label}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {ticket.block} Blok
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <Badge variant={ticket.status}>
                                                    {status.label}
                                                </Badge>
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    icon={<Eye size={16} />}
                                                    onClick={() => handleOpenDetail(ticket)}
                                                >
                                                    Detay
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={selectedTicket.title}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm) 0' }}>
                        <div>
                            <strong style={{ color: 'var(--color-text-secondary)' }}>Açıklama:</strong>
                            <p style={{ marginTop: 'var(--spacing-xs)', background: 'rgba(255,255,255,0.02)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                {selectedTicket.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                            <div><strong>Konum:</strong> {selectedTicket.block} Blok, Daire {selectedTicket.flat_no}</div>
                            <div><strong>Kategori:</strong> {getCategoryById(selectedTicket.category).label}</div>
                            <div><strong>Oluşturulma:</strong> {formatDate(selectedTicket.created_at)}</div>
                            <div><strong>Son Güncelleme:</strong> {formatRelativeTime(selectedTicket.updated_at)}</div>
                        </div>

                        {/* Assign Personnel Form */}
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                            <strong style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Personel Ata</strong>
                            <div className="flex gap-md">
                                <div style={{ flex: 1 }}>
                                    <Select
                                        value={selectedStaff}
                                        onChange={(e) => setSelectedStaff(e.target.value)}
                                        options={[
                                            { value: '', label: 'Personel Seçin...' },
                                            ...staffList.map(s => ({ value: s.uid, label: s.full_name }))
                                        ]}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleAssign}
                                    loading={assigning}
                                    icon={<UserPlus size={18} />}
                                >
                                    Ata
                                </Button>
                            </div>
                        </div>

                        {/* Ticket History Logs */}
                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-md)' }}>
                            <strong style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Talep Geçmişi</strong>
                            {ticketLogs.length === 0 ? (
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>Kayıt bulunamadı.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {ticketLogs.map((log) => (
                                        <div key={log.id} style={{ fontSize: 'var(--font-size-xs)', borderLeft: '2px solid var(--color-secondary-light)', paddingLeft: 'var(--spacing-sm)' }}>
                                            <div style={{ color: 'var(--color-text-tertiary)' }}>
                                                {formatDate(log.timestamp)}
                                            </div>
                                            <div style={{ fontWeight: 500 }}>
                                                {log.action === 'created' ? 'Talep oluşturuldu' :
                                                 log.action === 'assigned' ? 'Personel atandı' :
                                                 log.action === 'status_change' ? `Durum ${getStatusById(log.from).label} ➔ ${getStatusById(log.to).label} olarak güncellendi` :
                                                 log.action === 'rated' ? `Değerlendirildi: ${log.details}` : log.details || 'Güncellendi'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminTickets;
