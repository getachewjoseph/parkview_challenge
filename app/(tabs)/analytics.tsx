/**
 * Analytics Dashboard
 * 
 * Provides comprehensive analytics for fall risk assessment including:
 * - Fall trends over time
 * - Exercise correlation with fall frequency
 * - Risk factor analysis from screening data
 * - Calculated risk score with visual indicators
 * - Actionable insights and recommendations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
  TouchableOpacity,
  Share
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { api } from '../../lib/api';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const screenWidth = Dimensions.get('window').width;

interface ExerciseLog {
  week_start: string;
  minutes: number;
}

interface Fall {
  fall_date: string;
  location: string;
  activity: string;
  cause: string;
  injuries: string;
}

interface Screening {
  unsteady: boolean;
  worries: boolean;
  fallen: boolean;
  fall_count: number;
  fall_injured: string;
  created_at: string;
}

interface RiskFactors {
  hasRecentFalls: boolean;
  fallCount: number;
  lowExercise: number;
  screeningRisk: boolean;
}

interface AnalyticsData {
  exerciseLogs: ExerciseLog[];
  falls: Fall[];
  screening: Screening | null;
  riskScore: number;
  riskFactors: RiskFactors;
}

export default function AnalyticsScreen() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Very High', color: '#D32F2F', icon: 'warning' };
    if (score >= 60) return { level: 'High', color: '#FF6B6B', icon: 'alert-circle' };
    if (score >= 40) return { level: 'Moderate', color: '#FF9800', icon: 'information-circle' };
    if (score >= 20) return { level: 'Low', color: '#FFC107', icon: 'checkmark-circle' };
    return { level: 'Very Low', color: '#4CAF50', icon: 'checkmark-circle' };
  };

  const generatePDFReport = async () => {
    if (!analyticsData) return;

    setExportLoading(true);
    try {
      const riskLevel = getRiskLevel(analyticsData.riskScore);
      const currentDate = new Date().toLocaleDateString();
      
      // Create a simple text report that can be shared
      const textReport = `
FALL RISK ANALYTICS REPORT
Generated on ${currentDate}

OVERALL RISK ASSESSMENT
• Risk Score: ${analyticsData.riskScore}% (${riskLevel.level})
• Based on falls, exercise, and screening data analysis

QUICK STATISTICS
• Falls in last 6 months: ${analyticsData.falls.length}
• Exercise weeks logged: ${analyticsData.exerciseLogs.length}
• Average minutes per week: ${analyticsData.exerciseLogs.length > 0 
  ? Math.round(analyticsData.exerciseLogs.reduce((sum, log) => sum + log.minutes, 0) / analyticsData.exerciseLogs.length)
  : 0}
• Screening reported falls: ${analyticsData.screening?.fall_count || 0}

RISK FACTORS ANALYSIS
• Recent falls detected: ${analyticsData.riskFactors.hasRecentFalls ? 'Yes' : 'No'}
• Multiple falls (>2): ${analyticsData.riskFactors.fallCount > 2 ? 'Yes' : 'No'}
• Low exercise weeks: ${analyticsData.riskFactors.lowExercise}
• Screening risk indicators: ${analyticsData.riskFactors.screeningRisk ? 'Yes' : 'No'}

${analyticsData.falls.length > 0 ? `RECENT FALLS
${analyticsData.falls.slice(0, 5).map(fall => 
  `• ${formatDate(fall.fall_date)} - ${fall.location || 'Unknown location'}${fall.activity ? ` (${fall.activity})` : ''}`
).join('\n')}

` : ''}RECOMMENDATIONS
${analyticsData.riskScore >= 60 ? '• Consider consulting with your healthcare provider about fall prevention strategies\n' : ''}${analyticsData.riskFactors.lowExercise > 2 ? '• Increase weekly exercise to 150+ minutes for better fall prevention\n' : ''}${analyticsData.falls.length > 0 ? '• Review fall locations and activities to identify patterns\n' : ''}${analyticsData.riskScore < 40 ? '• Great job! Keep maintaining your current exercise routine\n' : ''}
Generated by Parkview Fall Risk Analytics
For medical advice, please consult with your healthcare provider
      `.trim();

      // Share the text report
      await Share.share({
        message: textReport,
        title: 'Fall Risk Analytics Report'
      });

      Alert.alert('Success', 'Report shared successfully!');
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const prepareExerciseChartData = () => {
    if (!analyticsData?.exerciseLogs.length) return null;

    const last8Weeks = analyticsData.exerciseLogs.slice(-8);
    return {
      labels: last8Weeks.map(log => formatDate(log.week_start)),
      datasets: [{
        data: last8Weeks.map(log => log.minutes),
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareFallsOverTimeData = () => {
    if (!analyticsData?.falls.length) return null;

    // Group falls by month
    const fallsByMonth: { [key: string]: number } = {};
    analyticsData.falls.forEach(fall => {
      const date = new Date(fall.fall_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      fallsByMonth[monthKey] = (fallsByMonth[monthKey] || 0) + 1;
    });

    const months = Object.keys(fallsByMonth).sort().slice(-6); // Last 6 months
    return {
      labels: months.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short' });
      }),
      datasets: [{
        data: months.map(month => fallsByMonth[month] || 0),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const prepareRiskFactorsData = () => {
    if (!analyticsData?.riskFactors) return null;

    const data = [
      {
        name: 'Recent Falls',
        value: analyticsData.riskFactors.hasRecentFalls ? 30 : 0,
        color: '#F44336',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Multiple Falls',
        value: analyticsData.riskFactors.fallCount > 2 ? 20 : 0,
        color: '#FF9800',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Low Exercise',
        value: analyticsData.riskFactors.lowExercise > 4 ? 25 : 0,
        color: '#9C27B0',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Screening Risk',
        value: analyticsData.riskFactors.screeningRisk ? 25 : 0,
        color: '#2196F3',
        legendFontColor: '#333',
        legendFontSize: 12
      }
    ].filter(item => item.value > 0);

    return data.length > 0 ? data : null;
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 16
    },
    propsForLabels: {
      rotation: 45
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No analytics data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const riskLevel = getRiskLevel(analyticsData.riskScore);
  const exerciseData = prepareExerciseChartData();
  const fallsData = prepareFallsOverTimeData();
  const riskFactorsData = prepareRiskFactorsData();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fall Risk Analytics</Text>
          <Text style={styles.subtitle}>Your comprehensive health overview</Text>
          <TouchableOpacity 
            style={[styles.exportButton, exportLoading && styles.exportButtonDisabled]}
            onPress={generatePDFReport}
            disabled={exportLoading}
          >
            <Ionicons name="document-text" size={16} color="white" />
            <Text style={styles.exportButtonText}>
              {exportLoading ? 'Sharing...' : 'Share Report'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Risk Score Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name={riskLevel.icon as any} size={24} color={riskLevel.color} />
            <Text style={styles.cardTitle}>Overall Risk Score</Text>
          </View>
          <View style={styles.riskScoreContainer}>
            <Text style={[styles.riskScore, { color: riskLevel.color }]}>
              {analyticsData.riskScore}%
            </Text>
            <View style={[styles.riskBadge, { backgroundColor: riskLevel.color }]}>
              <Text style={styles.riskLevel}>{riskLevel.level}</Text>
            </View>
          </View>
          <Text style={styles.riskDescription}>
            Based on falls, exercise, and screening data
          </Text>
        </View>

        {/* Exercise Trends */}
        {exerciseData && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Exercise Trends (8 weeks)</Text>
            </View>
            <LineChart
              data={exerciseData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
            <Text style={styles.chartNote}>
              Weekly exercise minutes. Target: 150+ minutes/week
            </Text>
          </View>
        )}

        {/* Falls Over Time */}
        {fallsData && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-down" size={24} color="#F44336" />
              <Text style={styles.cardTitle}>Falls Over Time</Text>
            </View>
            <LineChart
              data={fallsData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`
              }}
              style={styles.chart}
            />
            <Text style={styles.chartNote}>
              Monthly fall incidents over the last 6 months
            </Text>
          </View>
        )}

        {/* Risk Factors Breakdown */}
        {riskFactorsData && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Risk Factors</Text>
            </View>
            <PieChart
              data={riskFactorsData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={24} color="#9C27B0" />
            <Text style={styles.cardTitle}>Quick Stats</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{analyticsData.falls.length}</Text>
              <Text style={styles.statLabel}>Falls (6 months)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{analyticsData.exerciseLogs.length}</Text>
              <Text style={styles.statLabel}>Exercise Weeks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {analyticsData.exerciseLogs.length > 0 
                  ? Math.round(analyticsData.exerciseLogs.reduce((sum, log) => sum + log.minutes, 0) / analyticsData.exerciseLogs.length)
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Avg Minutes/Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {analyticsData.screening ? 
                  (analyticsData.screening.fall_count || 0) : 0}
              </Text>
              <Text style={styles.statLabel}>Reported Falls</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={24} color="#FFC107" />
            <Text style={styles.cardTitle}>Recommendations</Text>
          </View>
          {analyticsData.riskScore >= 60 && (
            <Text style={styles.recommendation}>
              • Consider consulting with your healthcare provider about fall prevention strategies
            </Text>
          )}
          {analyticsData.riskFactors.lowExercise > 2 && (
            <Text style={styles.recommendation}>
              • Increase weekly exercise to 150+ minutes for better fall prevention
            </Text>
          )}
          {analyticsData.falls.length > 0 && (
            <Text style={styles.recommendation}>
              • Review fall locations and activities to identify patterns
            </Text>
          )}
          {analyticsData.riskScore < 40 && (
            <Text style={[styles.recommendation, { color: '#4CAF50' }]}>
              • Great job! Keep maintaining your current exercise routine
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exportButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  exportButtonDisabled: {
    backgroundColor: '#ccc',
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  riskLevel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  chart: {
    marginVertical: 8,
    marginTop: 20,
    marginLeft: -20,
    borderRadius: 16,
  },
  chartNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});