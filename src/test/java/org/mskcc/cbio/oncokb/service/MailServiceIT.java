package org.mskcc.cbio.oncokb.service;

import org.mskcc.cbio.oncokb.config.Constants;

import org.mskcc.cbio.oncokb.RedisTestContainerExtension;
import org.mskcc.cbio.oncokb.OncokbPublicApp;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.config.application.EmailAddresses;
import org.mskcc.cbio.oncokb.domain.User;
import io.github.jhipster.config.JHipsterProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.mskcc.cbio.oncokb.domain.enumeration.MailType;
import org.mskcc.cbio.oncokb.service.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import java.io.*;
import java.net.URI;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Integration tests for {@link MailService}.
 */
@SpringBootTest(classes = OncokbPublicApp.class)
public class MailServiceIT {

    private static final String[] languages = {
        // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array
    };
    private static final Pattern PATTERN_LOCALE_3 = Pattern.compile("([a-z]{2})-([a-zA-Z]{4})-([a-z]{2})");
    private static final Pattern PATTERN_LOCALE_2 = Pattern.compile("([a-z]{2})-([a-z]{2})");

    // Testing email address for applicationProperties
    private static final String LICENSE_ADDR = "license@example.com";
    private static final String REGISTRATION_ADDR = "registration@example.com";
    private static final String CONTACT_ADDR = "contact@example.com";
    private static final String TECH_DEV_ADDR = "dev@example.com";

    @Autowired
    private JHipsterProperties jHipsterProperties;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private UserMailsService userMailsService;

    @Spy
    private JavaMailSenderImpl javaMailSender;

    @Captor
    private ArgumentCaptor<MimeMessage> messageCaptor;

    private MailService mailService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        doNothing().when(javaMailSender).send(any(MimeMessage.class));

        // specify application emails for testing
        applicationProperties.setEmailAddresses(new EmailAddresses());
        applicationProperties.getEmailAddresses().setLicenseAddress(LICENSE_ADDR);
        applicationProperties.getEmailAddresses().setContactAddress(CONTACT_ADDR);
        applicationProperties.getEmailAddresses().setRegistrationAddress(REGISTRATION_ADDR);
        applicationProperties.getEmailAddresses().setTechDevAddress(TECH_DEV_ADDR);

        mailService = new MailService(jHipsterProperties, javaMailSender, messageSource, templateEngine, userMailsService, applicationProperties);
    }

    @Test
    public void testSendEmail() throws Exception {
        mailService.sendEmail("john.doe@example.com", jHipsterProperties.getMail().getFrom(), null, "testSubject", "testContent", null,false, false);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getSubject()).isEqualTo("testSubject");
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("john.doe@example.com");
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent()).isInstanceOf(String.class);
        assertThat(message.getContent().toString()).isEqualTo("testContent");
        assertThat(message.getDataHandler().getContentType()).isEqualTo("text/plain; charset=UTF-8");
    }

    @Test
    public void testSendHtmlEmail() throws Exception {
        mailService.sendEmail("john.doe@example.com", jHipsterProperties.getMail().getFrom(), null, "testSubject", "testContent", null, false, true);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getSubject()).isEqualTo("testSubject");
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("john.doe@example.com");
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent()).isInstanceOf(String.class);
        assertThat(message.getContent().toString()).isEqualTo("testContent");
        assertThat(message.getDataHandler().getContentType()).isEqualTo("text/html;charset=UTF-8");
    }

    @Test
    public void testSendMultipartEmail() throws Exception {
        mailService.sendEmail("john.doe@example.com", jHipsterProperties.getMail().getFrom(), null, "testSubject", "testContent", null, true, false);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        MimeMultipart mp = (MimeMultipart) message.getContent();
        MimeBodyPart part = (MimeBodyPart) ((MimeMultipart) mp.getBodyPart(0).getContent()).getBodyPart(0);
        ByteArrayOutputStream aos = new ByteArrayOutputStream();
        part.writeTo(aos);
        assertThat(message.getSubject()).isEqualTo("testSubject");
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("john.doe@example.com");
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent()).isInstanceOf(Multipart.class);
        assertThat(aos.toString()).isEqualTo("\r\ntestContent");
        assertThat(part.getDataHandler().getContentType()).isEqualTo("text/plain; charset=UTF-8");
    }

    @Test
    public void testSendMultipartHtmlEmail() throws Exception {
        mailService.sendEmail("john.doe@example.com", jHipsterProperties.getMail().getFrom(), null, "testSubject", "testContent", null, true, true);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        MimeMultipart mp = (MimeMultipart) message.getContent();
        MimeBodyPart part = (MimeBodyPart) ((MimeMultipart) mp.getBodyPart(0).getContent()).getBodyPart(0);
        ByteArrayOutputStream aos = new ByteArrayOutputStream();
        part.writeTo(aos);
        assertThat(message.getSubject()).isEqualTo("testSubject");
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("john.doe@example.com");
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent()).isInstanceOf(Multipart.class);
        assertThat(aos.toString()).isEqualTo("\r\ntestContent");
        assertThat(part.getDataHandler().getContentType()).isEqualTo("text/html;charset=UTF-8");
    }

    @Test
    public void testSendEmailFromTemplate() throws Exception {
        UserDTO user = new UserDTO();
        user.setLogin("john");
        user.setEmail("john.doe@example.com");
        user.setLangKey("en");
        mailService.sendEmailFromTemplate(user, MailType.TEST);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getSubject()).isEqualTo("OncoKB Info"); // default title set in messages.properties
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(user.getEmail());
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent().toString()).isEqualToNormalizingNewlines("<html>test title, http://127.0.0.1:9095, john</html>\n");
        assertThat(message.getDataHandler().getContentType()).isEqualTo("text/html;charset=UTF-8");
    }

    @Test
    public void testSendActivationEmail() throws Exception {
        UserDTO user = new UserDTO();
        user.setLangKey(Constants.DEFAULT_LANGUAGE);
        user.setLogin("john");
        user.setEmail("john.doe@example.com");
        mailService.sendActivationEmail(user);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(user.getEmail());
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent().toString()).isNotEmpty();
        assertThat(message.getDataHandler().getContentType()).isEqualTo("text/html;charset=UTF-8");
    }

    @Test
    public void testCreationEmail() throws Exception {
        UserDTO user = new UserDTO();
        user.setLangKey(Constants.DEFAULT_LANGUAGE);
        user.setLogin("john");
        user.setEmail("john.doe@example.com");
        mailService.sendCreationEmail(user);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(user.getEmail());
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent().toString()).isNotEmpty();
        assertThat(message.getDataHandler().getContentType()).isEqualTo("text/html;charset=UTF-8");
    }

    @Test
    public void testSendPasswordResetMail() throws Exception {
        UserDTO user = new UserDTO();
        user.setLangKey(Constants.DEFAULT_LANGUAGE);
        user.setLogin("john");
        user.setEmail("john.doe@example.com");
        mailService.sendPasswordResetMail(user);
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(user.getEmail());
        assertThat(message.getFrom()[0].toString()).isEqualTo(jHipsterProperties.getMail().getFrom());
        assertThat(message.getContent().toString()).isNotEmpty();
        assertThat(message.getDataHandler().getContentType()).isEqualTo("text/html;charset=UTF-8");
    }

    @Test
    public void testSendEmailWithException() {
        doThrow(MailSendException.class).when(javaMailSender).send(any(MimeMessage.class));
        assertThatThrownBy(
            () -> mailService.sendEmail("john.doe@example.com", jHipsterProperties.getMail().getFrom(), null, "testSubject", "testContent", null, false, false)
        ).isInstanceOf(MailSendException.class);
    }

    @Test
    public void testSendLocalizedEmailForAllSupportedLanguages() throws Exception {
        UserDTO user = new UserDTO();
        user.setLogin("john");
        user.setEmail("john.doe@example.com");
        for (String langKey : languages) {
            user.setLangKey(langKey);
            mailService.sendEmailFromTemplate(user, MailType.TEST);
            verify(javaMailSender, atLeastOnce()).send(messageCaptor.capture());
            MimeMessage message = messageCaptor.getValue();

            String propertyFilePath = "i18n/messages_" + getJavaLocale(langKey) + ".properties";
            URL resource = this.getClass().getClassLoader().getResource(propertyFilePath);
            File file = new File(new URI(resource.getFile()).getPath());
            Properties properties = new Properties();
            properties.load(new InputStreamReader(new FileInputStream(file), Charset.forName("UTF-8")));

            String emailTitle = (String) properties.get("email.test.title");
            assertThat(message.getSubject()).isEqualTo(emailTitle);
            assertThat(message.getContent().toString()).isEqualToNormalizingNewlines("<html>" + emailTitle + ", http://127.0.0.1:9095, john</html>\n");
        }
    }

    @Test
    public void testSendEmailFromSlack() throws MessagingException, IOException {
        String TEST_SUB = "testSubject";
        String TEST_USER_EMAIL = "john.doe@example.com";

        UserDTO user = new UserDTO();
        user.setLogin("john");
        user.setEmail(TEST_USER_EMAIL);
        user.setLangKey("en");

        MailType mailType = MailType.CLARIFY_ACADEMIC_NON_INSTITUTE_EMAIL;

        mailService.sendEmailFromSlack(user, TEST_SUB, "testBody", mailType, "test");
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();

        assertThat(message.getSubject()).isEqualTo(TEST_SUB);
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(TEST_USER_EMAIL);
        assertThat(message.getFrom()[0].toString()).isEqualTo(REGISTRATION_ADDR);
        assertThat(message.getRecipients(Message.RecipientType.CC) == null).isTrue();
    }

    @Test
    public void testSendEmailFromSlackLicenseOptions() throws MessagingException, IOException {
        // Mainly test the email send from
        String TEST_SUB = "testSubject";
        String TEST_USER_EMAIL = "john.doe@example.com";

        UserDTO user = new UserDTO();
        user.setLogin("john");
        user.setEmail(TEST_USER_EMAIL);
        user.setLangKey("en");

        MailType mailType = MailType.LICENSE_OPTIONS;

        mailService.sendEmailFromSlack(user, TEST_SUB, "testBody", mailType, "test");
        verify(javaMailSender).send(messageCaptor.capture());
        MimeMessage message = messageCaptor.getValue();
        assertThat(message.getSubject()).isEqualTo(TEST_SUB);
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo(TEST_USER_EMAIL);
        assertThat(message.getFrom()[0].toString()).isEqualTo(LICENSE_ADDR);
        assertThat(message.getRecipients(Message.RecipientType.CC) != null && message.getRecipients(Message.RecipientType.CC).length == 1).isTrue();
        assertThat(message.getRecipients(Message.RecipientType.CC)[0].toString()).isEqualTo(LICENSE_ADDR);
    }

    /**
     * Convert a lang key to the Java locale.
     */
    private String getJavaLocale(String langKey) {
        String javaLangKey = langKey;
        Matcher matcher2 = PATTERN_LOCALE_2.matcher(langKey);
        if (matcher2.matches()) {
            javaLangKey = matcher2.group(1) + "_"+ matcher2.group(2).toUpperCase();
        }
        Matcher matcher3 = PATTERN_LOCALE_3.matcher(langKey);
        if (matcher3.matches()) {
            javaLangKey = matcher3.group(1) + "_" + matcher3.group(2) + "_" + matcher3.group(3).toUpperCase();
        }
        return javaLangKey;
    }
}
