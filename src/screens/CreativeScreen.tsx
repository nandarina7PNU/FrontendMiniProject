import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const CreativeScreen: React.FC = () => {
  // 현재 화면에 표시되는 값
  const [display, setDisplay] = useState<string>('0');
  // 현재 입력 중인 숫자값 (계산에 사용)
  const [currentInput, setCurrentInput] = useState<string>('0');
  // 이전에 입력한 값
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  // 선택한 연산자 (+, -, ×, ÷)
  const [operator, setOperator] = useState<string | null>(null);
  // 새로운 숫자 입력을 시작해야 하는지 여부
  const [shouldResetDisplay, setShouldResetDisplay] = useState<boolean>(false);

  /**
   * 숫자 버튼을 눌렀을 때 호출되는 함수
   * @param num - 입력된 숫자 (0~9)
   */
  const handleNumberPress = (num: string) => {
    if (shouldResetDisplay) {
      // 연산자를 선택한 후 새로운 숫자 입력 시작
      const newInput = num;
      setCurrentInput(newInput);
      setDisplay(display + ' ' + newInput);
      setShouldResetDisplay(false);
    } else {
      // 기존 숫자에 새로운 숫자 추가
      const newInput = currentInput === '0' ? num : currentInput + num;
      setCurrentInput(newInput);
      setDisplay(currentInput === '0' ? num : display + num);
    }
  };

  /**
   * 연산자 버튼(+, -, ×, ÷)을 눌렀을 때 호출되는 함수
   * @param op - 선택한 연산자
   */
  const handleOperatorPress = (op: string) => {
    const currentValue = parseFloat(currentInput);

    // 이미 이전 값과 연산자가 있으면 먼저 계산 수행
    if (previousValue !== null && operator && !shouldResetDisplay) {
      const result = calculate(previousValue, currentValue, operator);
      setDisplay(String(result) + ' ' + op);
      setCurrentInput(String(result));
      setPreviousValue(result);
    } else {
      // 처음 연산자를 누를 때
      setDisplay(currentInput + ' ' + op);
      setPreviousValue(currentValue);
    }

    setOperator(op);
    setShouldResetDisplay(true);
  };

  /**
   * = 버튼을 눌렀을 때 최종 계산을 수행하는 함수
   */
  const handleEquals = () => {
    if (previousValue !== null && operator) {
      const currentValue = parseFloat(currentInput);
      const result = calculate(previousValue, currentValue, operator);
      setDisplay(String(result));
      setCurrentInput(String(result));
      setPreviousValue(null);
      setOperator(null);
      setShouldResetDisplay(true);
    }
  };

  /**
   * 실제 사칙연산을 수행하는 함수
   * @param prev - 이전 값
   * @param current - 현재 값
   * @param op - 연산자
   * @returns 계산 결과
   */
  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : 0; // 0으로 나누기 방지
      default:
        return current;
    }
  };

  /**
   * C(Clear) 버튼을 눌렀을 때 모든 값을 초기화하는 함수
   */
  const handleClear = () => {
    setDisplay('0');
    setCurrentInput('0');
    setPreviousValue(null);
    setOperator(null);
    setShouldResetDisplay(false);
  };

  /**
   * 계산기 버튼을 렌더링하는 컴포넌트
   */
  const Button = ({
    label,
    onPress,
    style,
  }: {
    label: string;
    onPress: () => void;
    style?: object;
  }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>계산기</Text>

      {/* 계산 결과 표시 화면 */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* 계산기 버튼 레이아웃 */}
      <View style={styles.buttonContainer}>
        {/* 첫 번째 줄: C와 연산자 */}
        <View style={styles.row}>
          <Button label="C" onPress={handleClear} style={styles.clearButton} />
          <Button
            label="÷"
            onPress={() => handleOperatorPress('÷')}
            style={styles.operatorButton}
          />
        </View>

        {/* 두 번째 줄: 7, 8, 9, × */}
        <View style={styles.row}>
          <Button label="7" onPress={() => handleNumberPress('7')} />
          <Button label="8" onPress={() => handleNumberPress('8')} />
          <Button label="9" onPress={() => handleNumberPress('9')} />
          <Button
            label="×"
            onPress={() => handleOperatorPress('×')}
            style={styles.operatorButton}
          />
        </View>

        {/* 세 번째 줄: 4, 5, 6, - */}
        <View style={styles.row}>
          <Button label="4" onPress={() => handleNumberPress('4')} />
          <Button label="5" onPress={() => handleNumberPress('5')} />
          <Button label="6" onPress={() => handleNumberPress('6')} />
          <Button
            label="-"
            onPress={() => handleOperatorPress('-')}
            style={styles.operatorButton}
          />
        </View>

        {/* 네 번째 줄: 1, 2, 3, + */}
        <View style={styles.row}>
          <Button label="1" onPress={() => handleNumberPress('1')} />
          <Button label="2" onPress={() => handleNumberPress('2')} />
          <Button label="3" onPress={() => handleNumberPress('3')} />
          <Button
            label="+"
            onPress={() => handleOperatorPress('+')}
            style={styles.operatorButton}
          />
        </View>

        {/* 다섯 번째 줄: 0과 = */}
        <View style={styles.row}>
          <Button
            label="0"
            onPress={() => handleNumberPress('0')}
            style={styles.zeroButton}
          />
          <Button
            label="="
            onPress={handleEquals}
            style={styles.equalsButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  displayContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  displayText: {
    fontSize: 48,
    color: '#000',
    fontWeight: '300',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 5,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 28,
    color: '#333',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    flex: 1.5,
  },
  operatorButton: {
    backgroundColor: '#4dabf7',
  },
  equalsButton: {
    backgroundColor: '#51cf66',
    flex: 1.5,
  },
  zeroButton: {
    flex: 2,
  },
});