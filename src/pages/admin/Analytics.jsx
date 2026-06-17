import React, { useState, useEffect } from 'react';
import { FileText, Clock, ThumbsUp, CheckCircle, BarChart2 } from 'lucide-react';
import { getAllTickets } from '../../services/ticketService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import { groupBy, calculateAverage } from '../../utils/helpers';
import { getCategoryById, BLOCKS } from '../../utils/constants';

const AdminAnalytics = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total: 0,
        completed: 0,
        completionRate: 0,
        avgRating: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getAllTickets();
            setTickets(data);

            const resolved = data.filter(t => ['resolved', 'closed'].includes(t.status));
            const ratings = data.filter(t => t.rating).map(t => t.rating);
            
            setMetrics({
                total: data.length,
                completed: resolved.length,
                completionRate: data.length > 0 ? Math.round((resolved.length / data.length) * 100) : 0,
                avgRating: calculateAverage(ratings),
            });
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryData = () => {
        const grouped = groupBy(tickets, 'category');
        const labels = Object.keys(grouped).map(key => getCategoryById(key).label);
        const values = Object.values(grouped).map(arr => arr.length);

        return { labels, values };
    };

    const getBlockData = () => {
        const grouped = groupBy(tickets, 'block');
        const labels = BLOCKS;
        const values = labels.map(block => grouped[block]?.length || 0);

        return { labels, values };
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="animate-fade-in-up">
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Analitik ve Raporlar</h1>

            {/* Performance Indicators */}
            <div className="grid grid-cols-4 gap-lg" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <Card className="animate-fade-in-up delay-1">
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(262, 83%, 58%, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary)',
                        }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                {metrics.total}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                                Toplam Talep
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="animate-fade-in-up delay-2">
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(142, 71%, 45%, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-success)',
                        }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                {metrics.completed}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                                Çözülenler
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="animate-fade-in-up delay-3">
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(199, 89%, 48%, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-info)',
                        }}>
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                %{metrics.completionRate}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                                Çözüm Oranı
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="animate-fade-in-up delay-4">
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsla(38, 92%, 50%, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-warning)',
                        }}>
                            <ThumbsUp size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
                                {metrics.avgRating || '-'}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                                Memnuniyet Puanı
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-2 gap-lg">
                <Card>
                    <Card.Header>
                        <Card.Title>Kategori Bazlı Dağılım</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {tickets.length > 0 ? (
                            <PieChart data={getCategoryData()} title="Kategoriler" />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-tertiary)' }}>
                                Veri bulunamadı
                            </div>
                        )}
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header>
                        <Card.Title>Blok Bazlı Talep Dağılımı</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {tickets.length > 0 ? (
                            <BarChart data={getBlockData()} title="Blok Dağılımı" />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-tertiary)' }}>
                                Veri bulunamadı
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default AdminAnalytics;
