import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

const InfoSection = ({ header, content }) => (
  <View style={styles.section}>
    <Text style={styles.header}>{header}</Text>
    {content.map((item, index) => (
      <View key={index} style={styles.paragraphContainer}>
        <Text style={styles.paragraph}>
          {item.text}
        </Text>
        {item.links && item.links.map((link, linkIndex) => (
          <Text 
            key={linkIndex} 
            style={styles.linkText} 
            onPress={() => Linking.openURL(link.url)}
          >
            {link.text} <FontAwesome name="external-link" size={12} color="#007bff" />
          </Text>
        ))}
      </View>
    ))}
  </View>
);

export default function PatientInfoScreen() {
  const aboutFallsContent = [
    {
      text: 'The United States as a whole is experiencing a major growth in the elderly population as the baby boomer generation retires. Indiana is no exception, with an estimated 13% increase in adults who are 60 years or older from 2023 to 2028, and an additional increase of 7% by 2033.',
      links: [
        { text: 'Source: U.S. Census Data', url: 'https://data.census.gov/' }
      ]
    },
    {
      text: 'Our aging population will increase the demand for healthcare services since older adults require more medical attention, experience greater health declines, and consume more home and assisted living care as well. The cost of supporting our senior citizens will comprise a significant portion of the overall healthcare costs in Indiana over the next 10 years.'
    },
    {
      text: 'Fall injuries in the adult population often lead to more medical complications and extended hospital stays. One study showed that 88% of emergency department visits and hospitalizations of hip fractures among adults aged 65 and above were a result of falls.',
      links: [
        { text: 'Source: Research Study', url: 'https://doi.org/10.1177/08982643221132450' }
      ]
    },
    {
      text: 'Hence, the treatment of hip fractures and other injuries often lead to increased medical costs as patients must receive medications (such as narcotics), surgical interventions, and imaging. Likewise there is an increased incidence of deep vein thrombosis (DVT) and pneumonia following hip surgery, especially among the elderly population. Hence, comorbidities are often present when an elderly patient is hospitalized for a fall, especially if the treatment involves surgery for a hip fracture. These comorbidities will only complicate medical treatment, driving up medical costs for the patients and providers and increasing the possibility of mortality.',
      links: [
        { text: 'Hip Fracture Treatment Costs', url: 'https://doi.org/10.1016/j.berh.2014.02.003' },
        { text: 'DVT Risk Study', url: 'https://doi.org/10.2147/CIA.S161191' },
        { text: 'Pneumonia Risk Study', url: 'https://doi.org/10.2147/CIA.S268118' }
      ]
    },
    {
      text: 'Preventing falls not only reduces healthcare costs but provides quality of life benefits for elderly individuals. By preventing a fall, we support elderly individuals\' ability to live independent and healthy lives. Not to mention, we reduce their risk of developing significant comorbidities like pneumonia or DVT associated with hospitalizations. Hence, we want to support you in your journey in reducing your risk of falling through evidence-based behavioral interventions!'
    }
  ];

  const whyExerciseContent = [
    {
      text: 'Numerous studies have shown that Tai chi is one of the most effective ways of reducing an elderly person\'s risk of falling in the future. In particular, studies in reputed medical journals have shown that daily exercise helps reduce an elderly person\'s risk for falling.',
      links: [
        { text: 'PubMed Research', url: 'https://pubmed.ncbi.nlm.nih.gov/24169944/' }
      ]
    },
    {
      text: 'One of the most well-studied exercise interventions is Tai Chi, which focuses on improving balance and stability.',
      links: [
        { text: 'Tai Chi Benefits Study', url: 'https://www.canr.msu.edu/news/tai-chi-a-gentle-path-to-preventing-falls-and-improving-community-well-being' }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Patient Information</Text>
          <Text style={styles.subtitle}>Fall Prevention & Exercise Benefits</Text>
        </View>
        
        <InfoSection header="About Falls" content={aboutFallsContent} />
        <InfoSection header="Why Exercise and Tai Chi?" content={whyExerciseContent} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#81C784',
    paddingBottom: 8,
  },
  paragraphContainer: {
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343a40',
    marginBottom: 8,
    textAlign: 'justify',
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 4,
    fontWeight: '500',
  },
});