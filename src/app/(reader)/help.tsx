import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { ScreenBar } from '@/components/screen-bar'
import { Colors, FontSize, Radius, Shadow } from '@/constants/theme'

const FAQS = [
  {
    q: 'What do I do if the meter is inaccessible?',
    a: 'Add a note on the Meter Scan screen describing the reason (e.g. "gate locked", "dog in yard"). Submit the reading as pending and report to your supervisor.',
  },
  {
    q: 'What if the current reading is lower than the previous?',
    a: 'The app will block submission and show a validation error. This usually means a meter replacement or rollover. Contact your supervisor before proceeding.',
  },
  {
    q: 'How do I re-scan a consumer I already submitted?',
    a: 'Go to History, find the consumer, and note their account number. Use the QR Scanner and manually enter the account number to pull up their profile again.',
  },
  {
    q: 'What is the billing rate structure?',
    a: 'Basic charge covers the first 10 m³ at ₱150 fixed. Tier 1 (11–20 m³): ₱15.50/m³. Tier 2 (21–30 m³): ₱18.00/m³. Tier 3 (31+ m³): ₱22.00/m³. VAT of 12% is added to the total.',
  },
  {
    q: 'How do I export my monthly report?',
    a: 'Go to Profile → Export Reports. A full summary of the current billing cycle will be shown. Tap "Download Report (PDF)" to save it to your device.',
  },
  {
    q: 'What if the QR code is damaged or unreadable?',
    a: 'Use the manual account number entry on the Scanner screen. Type the account number (e.g. ACC-00142) in the input field and tap "Find".',
  },
]

export default function HelpScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  function toggleFaq(i: number) {
    setOpenFaq(openFaq === i ? null : i)
  }

  function handleSend() {
    if (!message.trim()) {
      Alert.alert('Empty Message', 'Please type your message before sending.')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setMessage('')
      Alert.alert('Message Sent', 'Your message has been sent to the administrator. You will be contacted within 1 business day.')
    }, 1500)
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenBar
        title="Help & Support"
        subtitle="FAQs and contact information"
        onBack={() => router.back()}
      />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Contact card */}
        <Text style={styles.sectionTitle}>Contact Administrator</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>◉</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Administrator</Text>
              <Text style={styles.contactValue}>Engr. Ramon Dela Cruz</Text>
            </View>
          </View>
          <View style={styles.contactDivider} />
          <View style={styles.contactRow}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>☎</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone / Viber</Text>
              <Text style={styles.contactValue}>+63 917 123 4567</Text>
            </View>
          </View>
          <View style={styles.contactDivider} />
          <View style={styles.contactRow}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>@</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>admin@bwrwsai.com</Text>
            </View>
          </View>
          <View style={styles.contactDivider} />
          <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
            <View style={styles.contactIconWrap}>
              <Text style={styles.contactIcon}>⌚</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Office Hours</Text>
              <Text style={styles.contactValue}>Mon – Fri, 8:00 AM – 5:00 PM</Text>
            </View>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {FAQS.map((faq, i) => (
            <View key={i} style={[styles.faqItem, i === FAQS.length - 1 && { borderBottomWidth: 0 }]}>
              <TouchableOpacity style={styles.faqQuestion} onPress={() => toggleFaq(i)} activeOpacity={0.75}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={[styles.faqChevron, openFaq === i && styles.faqChevronOpen]}>›</Text>
              </TouchableOpacity>
              {openFaq === i && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Send message */}
        <Text style={styles.sectionTitle}>Send a Message</Text>
        <View style={styles.messageCard}>
          <Text style={styles.messageHint}>
            Describe your issue or question and the admin will get back to you within 1 business day.
          </Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here…"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.sendBtn, sending && { opacity: 0.75 }]}
            onPress={handleSend}
            activeOpacity={0.88}
            disabled={sending}
          >
            <Text style={styles.sendBtnText}>{sending ? 'Sending…' : 'Send Message'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textSecondary, marginBottom: 10 },
  contactCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
    overflow: 'hidden', marginBottom: 24,
  },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
  },
  contactDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  contactIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.infoBg, alignItems: 'center', justifyContent: 'center',
  },
  contactIcon: { fontSize: 16, color: Colors.primary },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  contactValue: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  faqCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
    overflow: 'hidden', marginBottom: 24,
  },
  faqItem: {
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  faqQuestion: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, gap: 10,
  },
  faqQ: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },
  faqChevron: { fontSize: 22, color: Colors.textMuted, transform: [{ rotate: '0deg' }] },
  faqChevronOpen: { transform: [{ rotate: '90deg' }], color: Colors.primary },
  faqAnswer: {
    backgroundColor: '#f8faff', paddingHorizontal: 14, paddingBottom: 14, paddingTop: 0,
  },
  faqA: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  messageCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 18, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  messageHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 12, lineHeight: 18 },
  messageInput: {
    backgroundColor: Colors.background, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FontSize.sm, color: Colors.textPrimary,
    minHeight: 110, marginBottom: 14,
  },
  sendBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    height: 50, alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  sendBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
})
