import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import styles from "../styles/contacto.module.css";

const ContactPage = () => {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null as File | null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type !== "image/jpeg") {
      alert(intl.formatMessage({ id: "fileNotJPG" }));
      return;
    }
    setFormData({ ...formData, file });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      alert(intl.formatMessage({ id: "emailInvalido" }));
      return;
    }
    // Aquí se manejaría la lógica de envío de los datos del formulario, por ejemplo a un API.
    alert(intl.formatMessage({ id: "formSubmitted" }));
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">{intl.formatMessage({ id: "nombre" })}</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />

        <label htmlFor="reason">{intl.formatMessage({ id: "motivo" })}</label>
        <select id="reason" name="reason" value={formData.reason} onChange={handleInputChange} required>
          <option value="info">{intl.formatMessage({ id: "motivoInfo" })}</option>
          <option value="bug">{intl.formatMessage({ id: "motivoBug" })}</option>
          <option value="commercial">{intl.formatMessage({ id: "motivoComercial" })}</option>
          <option value="invoice">{intl.formatMessage({ id: "motivoFactura" })}</option>
          <option value="other">{intl.formatMessage({ id: "motivoOtro" })}</option>
        </select>

        <label htmlFor="email">{intl.formatMessage({ id: "email" })}</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />

        <label htmlFor="message">{intl.formatMessage({ id: "mensaje" })}</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required></textarea>

        <label htmlFor="imageUpload">{intl.formatMessage({ id: "subirImagen" })}</label>
        <input type="file" id="imageUpload" name="imageUpload" accept="image/jpeg" onChange={handleFileChange} />

        <button type="submit">{intl.formatMessage({ id: "enviar" })}</button>
      </form>
    </div>
  );
};

export default ContactPage;
