import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import usePortal from 'react-useportal';
import { useTranslation } from 'react-i18next';

// Form
import { useForm, Controller } from 'react-hook-form';
import { useStateMachine } from 'little-state-machine';
import { yupResolver } from '@hookform/resolvers';
import { ErrorMessage } from '@hookform/error-message';
import * as Yup from 'yup';

// Update Action
import { updateAction } from 'utils/wizard';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Components
import WizardButtons from 'components/WizardButtons';
import OptionList from 'components/OptionList';

// Icons
import { ReactComponent as ExclamationSVG } from 'assets/icons/exclamationCircle.svg';

// Styles
import { TextErrorContainer } from 'containers/Welcome/style';
import {
  QuestionText, MainContainer, QuestionInput, QuestionNote,
} from '../style';

const schema = Yup.object({
  sick: Yup.string().required('sickStateRequired'),
  zipcode: Yup.string().required('sickStateRequired')
}).defined();

type Step1Type = Yup.InferType<typeof schema>;

const Step1 = ({
  previousStep,
  nextStep,
  storeKey,
  metadata,
}: Wizard.StepProps) => {
  // Hooks
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });
  const {
    setDoGoBack, setTitle, setType, setSubtitle,
  } = useHeaderContext();
  const history = useHistory();
  const { t } = useTranslation();
  const { state, action } = useStateMachine(updateAction(storeKey));

  // States
  const [activeStep, setActiveStep] = React.useState(true);

  // Form
  const {
    control, handleSubmit, formState,
  } = useForm({
    mode: 'onChange',
    defaultValues: state?.[storeKey],
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  const handleDoBack = React.useCallback(() => {
    setActiveStep(false);
    if (previousStep) {
      history.push(previousStep);
    } else {
      history.goBack();
    }
  }, [history, previousStep]);

  const {
    isValid,
  } = formState;

  useEffect(() => {
    scrollToTop();
    setTitle(`${t('questionary:title')}`);
    setSubtitle(t(''));
    setType('primary');
    setDoGoBack(() => handleDoBack);
  }, [handleDoBack, setDoGoBack, setTitle, setType, setSubtitle, metadata, t]);

  // Handlers
  const onSubmit = async (values: Step1Type) => {
    if (values) {
      action(values);
      if(!state['submit-steps']?.patientId){
        const patientId = Math.floor(100000 + Math.random() * 900000).toString();
        action({patientId:patientId});
      }
      if (nextStep) {
        setActiveStep(false);
        history.push(nextStep);
      }
    }
  };

  return (
    <MainContainer>

      <QuestionText first hasNote>
        {t('questionary:illQuestion.question')}
      </QuestionText>
      <Controller
        control={control}
        name="sick"
        defaultValue=""
        render={({ onChange, value }) => (
          <OptionList
            singleSelection
            value={{ selected: value ? [value] : [] }}
            onChange={v => onChange(v.selected[0])}
            items={[
              {
                value: 'yes',
                label: t('questionary:illQuestion.options.yes'),
              },
              {
                value: 'no',
                label: t('questionary:illQuestion.options.no'),
              },

              {
                value: 'unsure',
                label: t('questionary:illQuestion.options.unsure'),
              },
            ]}
          />
        )}
      />
      {/* Bottom Buttons */}
      <ErrorMessage
        errors={errors}
        name="sick"
        render={({ message }) => (
          <TextErrorContainer>
            <ExclamationSVG />
            {t(`main:${message}`, 'Please select an option')}
          </TextErrorContainer>
        )}
      />

      <QuestionText extraSpace hasNote>{t('questionary:locationQuestion.question')}</QuestionText>
      <QuestionNote style={{marginBottom:'10px'}}>{t('questionary:locationQuestion.note')}</QuestionNote>
      <QuestionText first hasNote style={{marginBottom:'10px'}}>{t('questionary:locationQuestion.zipcode')}</QuestionText>
      <Controller
        control={control}
        name="zipcode"
        defaultValue=""
        render={({ onChange, value, name }) => (
          <QuestionInput
            name={name}
            value={value}
            onChange={onChange}
            type="number"
            placeholder={t('questionary:locationQuestion.placeholder')}
            autoComplete="Off"
          />
        )}
      />
      {/* Bottom Buttons */}
      <ErrorMessage
        errors={errors}
        name="zipcode"
        render={({ message }) => (
          <TextErrorContainer>
            <ExclamationSVG />
            {t(`main:${message}`, 'Please enter your age')}
          </TextErrorContainer>
        )}
      />
      {activeStep && (
        <Portal>
          <WizardButtons
            leftLabel={t('questionary:nextButton')}
            leftHandler={handleSubmit(onSubmit)}
            leftDisabled={!isValid}
            invert
          />
        </Portal>
      )}
    </MainContainer>
  );
};

export default React.memo(Step1);
